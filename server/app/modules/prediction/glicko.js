// glicko2.js
const { Client, Pool } = require("pg");

class Glicko2 {
  constructor() {
    // Glicko-2 system constant.
    this.tau = 0.5;

    // Glicko-2 default values.
    this.defaultRating = 1500;
    this.defaultRD = 350;
    this.defaultSigma = 0.06;

    // Momentum Strength
    this.momentumStrength = 0.25;

    // Conversion between normal rating and Glicko-2 scale.
    this.scale = 173.7178;

    // -----------------------------
    // League / Stage Config
    // -----------------------------
    this.leagueConfig = {
      stageCount: 4,
      stageGaps: [300, 140, 40]
    };

    // ----------------------------------------------------
    // Overall ratings
    // teamId -> {
    //     rating,
    //     rd,
    //     sigma
    // }
    // ----------------------------------------------------
    this.teamCache = new Map();

    // ----------------------------------------------------
    // Map-specific ratings
    //
    // mapName -> Map(teamId -> {
    //     rating,
    //     rd,
    //     sigma,
    //     games
    // })
    // ----------------------------------------------------
    this.mapCache = new Map();
  }

  // ========================================================
  // SCALE CONVERSIONS
  // ========================================================

  ratingToMu(rating) {
    return (rating - 1500) / this.scale;
  }

  muToRating(mu) {
    return 1500 + this.scale * mu;
  }

  rdToPhi(rd) {
    return rd / this.scale;
  }

  phiToRD(phi) {
    return this.scale * phi;
  }

  // ========================================================
  // GLICKO-2 FUNCTIONS
  // ========================================================

  g(phi) {
    return 1 / Math.sqrt(1 + (3 * Math.pow(phi, 2)) / Math.pow(Math.PI, 2));
  }

  expectedScore(mu, opponentMu, opponentPhi) {
    const gValue = this.g(opponentPhi);
    return 1 / (1 + Math.exp(-gValue * (mu - opponentMu)));
  }

  // ========================================================
  // VOLATILITY
  // ========================================================

  calculateNewSigma(phi, sigma, delta, variance) {
    const tau = this.tau;

    // Glicko-2 notation:
    // a = ln(sigma^2)
    const a = Math.log(sigma * sigma);
    const deltaSquared = delta * delta;
    const phiSquared = phi * phi;
    const tauSquared = tau * tau;

    // --------------------------------------------------------
    // f(x) from the Glicko-2 specification.
    // --------------------------------------------------------

    const f = (x) => {
      const ex = Math.exp(x);
      const numerator = ex * (deltaSquared - phiSquared - variance - ex);
      const denominator = 2 * Math.pow(phiSquared + variance + ex, 2);
      const firstTerm = numerator / denominator;
      const secondTerm = (x - a) / tauSquared;

      return firstTerm - secondTerm;
    };

    // --------------------------------------------------------
    // Find the two bounds A and B.
    // --------------------------------------------------------

    let A = a;

    let B;

    if (deltaSquared > phiSquared + variance) {
      B = Math.log(deltaSquared - phiSquared - variance);
    } else {
      // IMPORTANT:
      //
      // The old version could theoretically loop forever.
      // Put a hard limit on this search.
      //

      let k = 1;
      const MAX_K = 1000;

      while (true) {
        B = a - k * tau;

        if (f(B) < 0) {
          break;
        }

        k++;

        if (k > MAX_K) {
          console.warn(
            "Glicko-2 volatility bound " + "search reached maximum iterations.",
          );

          // Fall back to the current volatility.
          return sigma;
        }
      }
    }

    // --------------------------------------------------------
    // Illinois algorithm.
    // --------------------------------------------------------

    let fA = f(A);
    let fB = f(B);

    const EPSILON = 0.000001;

    const MAX_ITERATIONS = 100;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      if (Math.abs(B - A) <= EPSILON) {
        break;
      }

      const denominator = fB - fA;

      // Prevent division by zero.
      if (Math.abs(denominator) < Number.EPSILON) {
        break;
      }

      const C = A + ((A - B) * fA) / denominator;

      const fC = f(C);

      if (fC * fB < 0) {
        A = B;
        fA = fB;
      } else {
        fA = fA / 2;
      }

      B = C;
      fB = fC;
    }

    // --------------------------------------------------------
    // New volatility.
    // --------------------------------------------------------

    const newSigma = Math.exp(A / 2);

    // Safety check.
    if (!Number.isFinite(newSigma) || newSigma <= 0) {
      console.warn(
        "Invalid Glicko-2 volatility calculated. " + "Keeping previous sigma.",
      );

      return sigma;
    }

    return newSigma;
  }

  //----------------------------
  // Calculate Liga Boost
  // ---------------------------
  getStageBoost(stageID, stages){
    //map Toornament stageID to internal order

    if(stages===undefined)
      return 0;
    const stageID_map = stages;
    
    const stage = stageID_map[stageID];

    if(stage === undefined){
      return 0;
    }

    const stageCount = this.leagueConfig.stageCount;
    //clamping for configuration error
    const clampedStage = Math.min(stage,stageCount);

    //Build offsets from configured Gaps
    const offsets = [0];

      for(let i = 0; i< stageCount-1;i++){
        const gap = Number(this.leagueConfig.stageGaps[i]);
    
      if(!Number.isFinite(gap)||gap<0){
        throw new Error(
          "Invalid league gap at index"+i + " " + gap
        )
      }
      offsets.push(offsets[i]-gap);
    }
    //Center values around 0
    const avg = offsets.reduce((sum,value)=> sum + value, 0)/offsets.length;

    return offsets[clampedStage -1] - avg;
  }

  // ========================================================
  // UPDATE ONE RATING
  // ========================================================

  updateRating(rating, rd, sigma, opponents) {
    const mu = this.ratingToMu(rating);
    const phi = this.rdToPhi(rd);

    // ----------------------------------------------------
    // Step 1:
    // Increase uncertainty before rating period.
    // ----------------------------------------------------

    const phiStar = Math.sqrt(Math.pow(phi, 2) + Math.pow(sigma, 2));

    // ----------------------------------------------------
    // Step 2:
    // Calculate variance.
    // ----------------------------------------------------

    let varianceInverse = 0;

    for (const opponent of opponents) {
      const opponentMu = this.ratingToMu(opponent.rating);
      const opponentPhi = this.rdToPhi(opponent.rd);
      const gValue = this.g(opponentPhi);
      const expected = this.expectedScore(mu, opponentMu, opponentPhi);
      varianceInverse += Math.pow(gValue, 2) * expected * (1 - expected);
    }

    // No useful information.
    if (varianceInverse <= 0) {
      return {
        rating,
        rd: this.phiToRD(phiStar),
        sigma,
      };
    }

    const variance = 1 / varianceInverse;

    // ----------------------------------------------------
    // Step 3:
    // Calculate delta.
    // ----------------------------------------------------

    let deltaSum = 0;

    for (const opponent of opponents) {
      const opponentMu = this.ratingToMu(opponent.rating);
      const opponentPhi = this.rdToPhi(opponent.rd);
      const gValue = this.g(opponentPhi);
      const expected = this.expectedScore(mu, opponentMu, opponentPhi);
      deltaSum += gValue * (opponent.score - expected);
    }

    const delta = variance * deltaSum;

    // ----------------------------------------------------
    // Step 4:
    // New volatility.
    // ----------------------------------------------------

    const newSigma = this.calculateNewSigma(phi, sigma, delta, variance);

    // ----------------------------------------------------
    // Step 5:
    // New RD.
    // ----------------------------------------------------

    const newPhi = 1 / Math.sqrt(1 / Math.pow(phiStar, 2) + 1 / variance);

    // ----------------------------------------------------
    // Step 6:
    // New rating.
    // ----------------------------------------------------

    const newMu = mu + Math.pow(newPhi, 2) * deltaSum;

    return {
      rating: this.muToRating(newMu),
      rd: this.phiToRD(newPhi),
      sigma: newSigma,
    };
  }

  // ========================================================
  // UPDATE A MATCH //might be that stageID and season boost must be pased here
  // ========================================================

  updateMatch(team1, team2, team1Won) {
    const team1Score = team1Won ? 1 : 0;
    const team2Score = team1Won ? 0 : 1;

    // IMPORTANT:
    //
    // Both teams are updated using their
    // ratings BEFORE this map.
    //

    const updated1 = this.updateRating(team1.rating, team1.rd, team1.sigma, [
      {
        rating: team2.rating,
        rd: team2.rd,
        score: team1Score,
      },
    ]);

    const updated2 = this.updateRating(team2.rating, team2.rd, team2.sigma, [
      {
        rating: team1.rating,
        rd: team1.rd,
        score: team2Score,
      },
    ]);

    return {
      team1: {...updated1, stageID: team1.stageID,initialStageBoost: team1.initialStageBoost},
      team2: {...updated2, stageID: team2.stageID,initialStageBoost: team2.initialStageBoost},
    };
  }

  // ========================================================
  // OVERALL TEAM RATINGS
  // ========================================================

  getTeamRating(teamId, stageID = null, stages = {}) {
    //check if team already exists
    if(this.teamCache.has(teamId)){
      return this.teamCache.get(teamId);
    }

    //if new team
    const stageBoost = this.getStageBoost(stageID, stages);
    const initialRating = this.defaultRating + stageBoost;

    const rating = {
      rating: initialRating,
      rd: this.defaultRD,
      sigma: this.defaultSigma,
      games:0,
      stageID: stageID,
      initialStageBoost: stageBoost
    };
    this.teamCache.set(teamId,rating);

    return rating;
  }

  updateTeamRating(teamId, rating) {
    this.teamCache.set(teamId, rating);
  }

  // ========================================================
  // MAP-SPECIFIC RATINGS
  // ========================================================

  getMapTeamRating(mapName, teamId) {
    // Get map cache.
    let mapRatings = this.mapCache.get(mapName);

    // Create map if necessary.
    if (!mapRatings) {
      mapRatings = new Map();

      this.mapCache.set(mapName, mapRatings);
    }

    // Get team's map rating.
    let rating = mapRatings.get(teamId);

    // Team has never played this map.
    if (!rating) {
      rating = {
        rating: this.defaultRating,
        rd: this.defaultRD,
        sigma: this.defaultSigma,
        games: 0,
      };

      mapRatings.set(teamId, rating);
    }

    return rating;
  }

  updateMapTeamRating(mapName, teamId, rating) {
    let mapRatings = this.mapCache.get(mapName);

    if (!mapRatings) {
      mapRatings = new Map();

      this.mapCache.set(mapName, mapRatings);
    }

    mapRatings.set(teamId, rating);
  }

  // ============================================================
  // MAP / OVERALL RATING BLENDING
  // ============================================================

  getBlendedPredictionRating(mapName, teamId) {
    const overall = this.getTeamRating(teamId);
    const mapRatings = this.mapCache.get(mapName);

    // --------------------------------------------------------
    // Team has never played this map.
    // --------------------------------------------------------

    if (!mapRatings || !mapRatings.has(teamId)) {
      return {
        rating: overall.rating,
        rd: overall.rd,
        sigma: overall.sigma,
        games: 0,
        source: "overall",
        mapWeight: 0,
        overallWeight: 1,
      };
    }

    const mapRating = mapRatings.get(teamId);
    const mapGames = mapRating.games || 0;

    // --------------------------------------------------------
    // 6 maps = 100% map-specific.
    // --------------------------------------------------------

    const mapWeight = Math.min(mapGames / 6, 1);
    const overallWeight = 1 - mapWeight;

    // --------------------------------------------------------
    // No map history.
    // --------------------------------------------------------

    if (mapGames <= 0) {
      return {
        rating: overall.rating,
        rd: overall.rd,
        sigma: overall.sigma,
        games: 0,
        source: "overall",
        mapWeight: 0,
        overallWeight: 1,
      };
    }

    // --------------------------------------------------------
    // Blend the ratings.
    // --------------------------------------------------------

    const blendedRating =
      overall.rating * overallWeight + mapRating.rating * mapWeight;

    // --------------------------------------------------------
    // Blend uncertainty.
    // --------------------------------------------------------

    const blendedRD = overall.rd * overallWeight + mapRating.rd * mapWeight;
    const blendedSigma =
      overall.sigma * overallWeight + mapRating.sigma * mapWeight;

    return {
      rating: blendedRating,
      rd: blendedRD,
      sigma: blendedSigma,
      games: mapGames,
      source: "blended",
      mapWeight,
      overallWeight,
      overallRating: overall.rating,
      overallRD: overall.rd,
      mapRating: mapRating.rating,
      mapRD: mapRating.rd,
    };
  }

  // ========================================================
  // Momentum
  // ========================================================

  calculateMomentumProbablility(
    baseProbability,
    current_t1_score,
    current_t2_score,
  ){
    const score_delta = current_t1_score-current_t2_score;
    if(score_delta===0){
      return baseProbability;
    }

    const p =Math.min(Math.max(baseProbability,0.000001),0.999999);

    const logit = Math.log(p/(1-p));

    const adjustedLogit = logit + this.momentumStrength *score_delta;
    const adjustedProbablility = 1/ (1+(Math.exp(-adjustedLogit)));

    return adjustedProbablility;
  }

  // ========================================================
  // WIN PROBABILITY
  // ========================================================

  calculateWinProbability(team1, team2) {
    const mu1 = this.ratingToMu(team1.rating);
    const mu2 = this.ratingToMu(team2.rating);
    const phi2 = this.rdToPhi(team2.rd);
    return this.expectedScore(mu1, mu2, phi2);
  }

  // ========================================================
  // CLEAR
  // ========================================================

  clearCache() {
    this.teamCache.clear();
    this.mapCache.clear();
  }

  // ========================================================
  // GET ALL OVERALL TEAMS
  // ========================================================

  getAllTeams() {
    return Array.from(this.teamCache.entries());
  }

  // ========================================================
  // GET ALL MAP RATINGS
  // ========================================================

  getAllMapRatings() {
    const result = {};

    for (const [mapName, teams] of this.mapCache.entries()) {
      result[mapName] = Array.from(teams.entries());
    }

    return result;
  }
}

module.exports = Glicko2;

