

      const { createElement: h, useState, useEffect } = React;

      function RectangleWithContent() {


        const [maps, setMaps] = useState([]);
        useEffect(()=>{
            fetch("/api/played_maps")
            .then((res)=> res.json())
            .then((data)=> {
                setMaps(Object.values(data)); //convert obj json to array
            })
            .catch((err)=>console.error("Error: ",err));
        },[]);
        
        if(!maps ){
            return h('div',null,"No Maps founnd");
        }
        if( maps.length===0){
            return h('div', null, "Waiting for first Map");
        }
            
        const map = maps[0];

        const containerStyle = {
          width: '300px',
          height: '420px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative',
        };

        const topStyle = {
          height: '10%',
          backgroundColor: 'green',
        };

        const bottomStyle = {
          height: '90%',
          backgroundColor: 'gray',
        };
        // Creates a red square ontop of bottomStyle
        const redbg ={
          position: 'absolute',
          
          top: '70%',
          left: '25%',
          width: '90px',
          height: '90px',
          transform: 'translateX(-50%)',
          backgroundColor: 'red',
        };

        const bluebg = {
          position: 'absolute',
          
          top: '70%',
          right: '0%',
          width: '90px',
          height: '90px',
          transform: 'translateX(-50%)',
          backgroundColor: 'lightblue',
        };

        // Overlay content (text/image)
        const overlayTextStyle = {
          position: 'absolute',
          top: '13px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontWeight: 'bold',
        };

        const overlayImageStyle = {
          position: 'absolute',
          top: '17%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '250px',
          borderRadius: '8px',
        };

        const ban_red ={
          position: 'absolute',
          top: '70%',
          left: '25%',
          transform: 'translateX(-50%)',
          width: '90px',
        };

        const ban_blue ={
          position: 'absolute',
          top: '70%',
          right: '0%',
          transform: 'translateX(-50%)',
          width: '90px',
        };

        return h('div', { style: containerStyle }, [
          h('div', { style: topStyle }),

          h('div', { style: bottomStyle },[
            h('div',{style: redbg}),
            h('div', {style: bluebg})
          ]),
          h('div', { style: overlayTextStyle }, map.name),
          h('img', {
            style: overlayImageStyle,
            src: map.image,
          }),
          
          h('img', {
            style: ban_red,
            src: map.ban_red,
          }),
          h('img',{
            style:ban_blue,
            src: map.ban_blue,
          })
            
        ]);
      }

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(h(RectangleWithContent));