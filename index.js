var PI=3.1415926535, M_WIDTH=450, M_HEIGHT=800, game_tick;
var app, game_res, game_tick=0, objects={}, baloons=[];
var screen_0, screen_1, screen_2, screen_3;
g_process=function(){};

var path=[[40,440],[46.3,377.9],[64.8,320],[94.2,270.3],[132.5,232.2],[177.1,208.2],[225,200],[272.9,208.2],[317.5,232.2],[355.8,270.3],[385.2,320],[403.7,377.9],[410,440],[403.7,502.1],[385.2,560],[355.8,609.7],[317.5,647.8],[272.9,671.8],[225,680],[177.1,671.8],[132.5,647.8],[94.2,609.7],[64.8,560],[46.3,502.1]];


class message_class extends PIXI.Sprite
{
	
	constructor()
	{
		super();
		this.process=function(){};
	}
	
	send(msg)
	{		
		this.prv_time=0;
		this.visible=true;
		this.text_dx=objects.message_text.sx-this.sx;
		
		this.x=-this.width;
		this.y=this.sy;		
		
		objects.message_text.text=msg;
		objects.message_text.visible=true;
		objects.message_text.x=this.x+this.text_dx;
		
		this.process=this.process_send.bind(this);
	}
	
	wait()
	{		
		this.prv_time=game_tick;
		this.process=this.process_wait.bind(this);
	}
	
	back()
	{		
		
		this.process=this.process_back.bind(this);
	}
	
	process_send()
	{
		this.x+=17;
		objects.message_text.x=this.x+this.text_dx;
		if (this.x>this.sx)
			this.wait();
		
	}
	process_wait()
	{
		if (game_tick>this.prv_time+3)
			this.back();
		
	}
	process_back()
	{
		this.x+=17;
		objects.message_text.x=this.x+this.text_dx;
		if (this.x>M_WIDTH)
		{
			this.visible=false;		
			objects.message_text.visible=false;			
		}
	
	}
	


	
}

class baloon_class extends PIXI.Sprite
{
	constructor()
	{
		super();
		this.tar_node=0;
		this.dx=0;
		this.dy=0;
		this.spd=1.5;
	}
	
	send()
	{		
	
		this.visible=true;
		this.retarget();		
	}
	
	retarget()
	{
		this.tar_node++;		
		if (this.tar_node==path.length)
			this.tar_node=0;
		
		var dx=path[this.tar_node][0]-this.x;
		var dy=path[this.tar_node][1]-this.y;
		var d=dx*dx+dy*dy;
		d=Math.sqrt(d);
		this.dx=dx/d;
		this.dy=dy/d;		
	}
	
	process()
	{				
		if (this.visible==false)
			return;
		
		this.x+=this.dx*this.spd;
		this.y+=this.dy*this.spd;
		
		var dx=path[this.tar_node][0]-this.x;
		var dy=path[this.tar_node][1]-this.y;
		var d=dx*dx+dy*dy;
		d=Math.sqrt(d);
		if (d<(this.spd+0.1))
			this.retarget();
	}
	
}

class arrow_class extends PIXI.Sprite
{
	constructor()
	{
		super();
		this.state="rot";		
		this.tar_node=0;
		this.dx=0;
		this.dy=0;
	}
	
	send(x,y,ang)
	{		
		this.x=x;
		this.y=y;
		this.rotation=ang;
		this.dx=Math.sin(this.rotation);
		this.dy=-Math.cos(this.rotation);
		this.state="go";
		this.visible=true;	
	}
	
	process()
	{				
		if (this.visible==false)
			return;
		
		
		if (this.state=="rot")
		{
			this.rotation=objects.bow.rotation;
		}
		else
		{
			this.x+=this.dx*10;
			this.y+=this.dy*10;
			
			if (this.x>M_WIDTH || this.x<0 || this.y>M_HEIGHT || this.y<0)
			{
				this.visible=false;				
				this.state="null";
			}

		}
		

	}
	
}

class screen_0_class
{
	constructor(id)
	{
		this.id=id;
	}
	
	draw_and_init()
	{
		
		//скрываем все объекты
		for (var i = 0; i < app.stage.children.length; i++)
			app.stage.children[i].visible=false;	
		
		//загружаем в соответствии с апгредй листом
		for (var i=0;i<load_list[this.id].length;i++)
		{	
			var obj_class=load_list[this.id][i][0];	
			var obj_name=load_list[this.id][i][1];
			
			if (obj_class=="block" || obj_class=="sprite" || obj_class=="text" ) 
			{
				objects[obj_name].visible=true;		
				eval(load_list[this.id][i][5]);
			}		
		}
		
	}
	
	process()
	{
		
	}	
}

class screen_1_class
{
	constructor(id)
	{
		this.id=id;
		this.last_send_time=0;
	}
	
	send_message(msg)
	{
		objects.message_box.send(msg);
	}
	
	draw_and_init()
	{
		
		//скрываем все объекты
		for (var i = 0; i < app.stage.children.length; i++)
			app.stage.children[i].visible=false;	
		
		//загружаем в соответствии с апгредй листом
		for (var i=0;i<load_list[this.id].length;i++)
		{	
			var obj_class=load_list[this.id][i][0];	
			var obj_name=load_list[this.id][i][1];
			
			if (obj_class=="block" || obj_class=="sprite" || obj_class=="text" ) 
			{
				objects[obj_name].visible=true;						
				eval(load_list[this.id][i][5]);
			}
			
			if (obj_class=="sprite_array" ) 
			{				
				var a_size=load_list[this.id][i][2];
				for (var n=0;n<a_size;n++)
					eval(load_list[this.id][i][5]);	
			}
			
		}
				
		g_process=this.process.bind(this);
		
		
		
		//карта событий
		this.event_id=0;
		this.events=[
		[1,"objects.baloons[0].send();"],
		[3,"objects.baloons[1].send();"],
		[5,"objects.baloons[2].send();"],
		[7,"objects.baloons[3].send();"],
		[9,"objects.baloons[4].send();"],
		[11,"objects.baloons[5].send();"],	
		[13,"objects.baloons[6].send();"],	
		[15,"objects.baloons[7].send();"],	
		[17,"objects.baloons[8].send();"],	
		[19,"objects.baloons[9].send();"],	
		[25,"this.send_message('25 seconds to summer');"],	
		[999999,"alert('long game'"],		
		];
		
		
		
	}
	
	send_arrow()
	{
		//запоминаем время выстрела
		this.last_send_time=game_tick;
		
		//ищем свободную стрелу для запуска
		for (var i=0;i<objects.arrows.length;i++)
		{
			if (objects.arrows[i].visible==false)
			{				
				objects.arrows[i].send(objects.bow.x,objects.bow.y,objects.bow.rotation);
				break;
			}
		}
		
		//высключаем базовую стрелу и лук и нажатие отменяем
		objects.arrow.visible=false;
		objects.bow.texture=game_res.resources['bow2'].texture;
		objects.bow.pointerdown=null;
		
		

	}
	
	process()
	{
		
		//крутим дартц
		objects.bow.rotation-=0.05;
		objects.arrow.rotation-=0.05;
		
		//обрабатываем шары
		objects.baloons.forEach(e=>e.process());
		
		//обрабатываем стрелки
		objects.arrows.forEach(e=>e.process());
		

		
		//обрабатываем события
		if (game_tick>this.events[this.event_id][0])
		{
			eval(this.events[this.event_id][1]);
			this.event_id++;		
		}			


		//обрабатываем сообщения
		if (objects.message_box.visible==true)
			objects.message_box.process();
		
		//возвращаем назад стрелу
		if (objects.arrow.visible==false)
		{
			if (game_tick>this.last_send_time+0.2)
			{
				objects.arrow.visible=true;
				objects.arrow.rotation=objects.bow.rotation;
				objects.bow.texture=game_res.resources['bow'].texture;
				objects.bow.pointerdown=function(){screen_1.send_arrow()};;
			}		
			
		}
		
		//обрабатываем попадания
		for(var i=0;i<objects.baloons.length;i++)
		{
			if(objects.baloons[i].visible==true)
			{
				for (var k=0;k<objects.arrows.length;k++)
				{
					if(objects.arrows[k].visible==true)
					{
					
						var dx=objects.baloons[i].x-objects.arrows[k].x;
						var dy=objects.baloons[i].y-objects.arrows[k].y;
						var d=dx*dx+dy*dy;
						d=Math.sqrt(d);
						if (d<30)
						{
							objects.baloons[i].visible=false;		
							objects.arrows[k].visible=false;
							this.send_message(k+" hit " + i);
						}					
					
					}
				}
			}
		}
			
		
		
		game_tick += 0.01666666;	
	}	

}

class screen_2_class
{
	constructor(id)
	{
		this.id=id;
	
	}
	
	draw_and_init()
	{
		
		//скрываем все объекты
		for (var i = 0; i < app.stage.children.length; i++)
			app.stage.children[i].visible=false;	
		
		//загружаем в соответствии с загрузочным листом
		for (var i=0;i<load_list[this.id].length;i++)
		{			
			var obj_class=load_list[this.id][i][0];	
			var obj_name=load_list[this.id][i][1];
			
			if (obj_class=="block" || obj_class=="sprite" || obj_class=="text" ) 
			{
				objects[obj_name].visible=true;		
				eval(load_list[this.id][i][5]);
				
			}		
			
			if (obj_class=="sprite_array" ) 
			{
				
				var a_size=load_list[this.id][i][2];
				for (var n=0;n<a_size;n++)
					eval(load_list[this.id][i][5]);		
				
			}
		
		}
		
			

		g_process=this.process.bind(this);
	}
	
	process()
	{

	}	

	

}

class screen_3_class
{
	constructor(id)
	{
		this.id=id;
		
	
	}
	
	
	draw_and_init()
	{

		//скрываем все объекты
		for (var i = 0; i < app.stage.children.length; i++)
			app.stage.children[i].visible=false;	
		
		//загружаем в соответствии с апгредй листом
		for (var i=0;i<load_list[this.id].length;i++)
		{	
			var obj_class=load_list[this.id][i][0];	
			var obj_name=load_list[this.id][i][1];
			
			if (obj_class=="block" || obj_class=="sprite" || obj_class=="text" ) 
			{
				objects[obj_name].visible=true;						
				eval(load_list[this.id][i][5]);
			}
			
			if (obj_class=="sprite_array" ) 
			{
				
				var a_size=load_list[this.id][i][2];
				for (var n=0;n<a_size;n++)
					eval(load_list[this.id][i][5]);		
				
			}
			
		}
		
		
		game_tick=0;
	}
	
	
	process()
	{
		
		
		
		game_tick += 0.01666666;		
	}	
	
	
}

function resize()
{
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    // The aspect ratio is the ratio of the screen's sizes in different dimensions.
    // The height-to-width aspect ratio of the game is HEIGHT / WIDTH.
    
    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      // If height-to-width ratio of the viewport is less than the height-to-width ratio
      // of the game, then the height will be equal to the height of the viewport, and
      // the width will be scaled.
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      // In the else case, the opposite is happening.
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    
    // Set the game screen size to the new values.
    // This command only makes the screen bigger --- it does not scale the contents of the game.
    // There will be a lot of extra room --- or missing room --- if we don't scale the stage.
    app.renderer.resize(nvw, nvh);
    
    // This command scales the stage to fit the new size of the game.
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

function load()
{
	
	
	//проверяем WEB GL	
	const gl = document.createElement('canvas').getContext('webgl2');
	if (!gl)
	{
	  if (typeof WebGL2RenderingContext !== 'undefined')
	  {
		alert('WebGL2 disabled or unavailable. Game can not start.');
		finish();
		return;
	  }
	  else
	  {
		alert('WebGL2 not supported. Game can not start.'); 
		finish();
		return;
	  }
	}
	
	//загружаем ресурсы в соответствии с листом загрузки
	game_res=new PIXI.Loader();	
	for (var l=0;l<load_list.length;l++)
		for (var i=0;i<load_list[l].length;i++)
			if (load_list[l][i][0]=="sprite" || load_list[l][i][0]=="image") 
				game_res.add(load_list[l][i][1], "res/"+load_list[l][i][1]+".png");
		
	
	
	
	game_res.load(load_complete);		
	game_res.onProgress.add(progress);
	
	function load_complete()
	{
		
		
		var elem = document.getElementById('myProgress');
		elem.parentNode.removeChild(elem);
		
		document.getElementById("demo").innerHTML = ""
		app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:true,backgroundColor : 0x060600});
		window.addEventListener("resize", resize());

		
				
		document.body.appendChild(app.view);
		document.body.style.backgroundColor = "blue";
				
		//создаем спрайты и массивы спрайтов из листа загрузки
		for (var l=0;l<load_list.length;l++)
		{
			for (var i=0;i<load_list[l].length;i++)
			{			
				var obj_class=load_list[l][i][0];
				var obj_name=load_list[l][i][1];

				switch(obj_class)
				{			
					case "sprite":
						objects[obj_name]=new PIXI.Sprite(game_res.resources[obj_name].texture);
						objects[obj_name].x=load_list[l][i][2];
						objects[obj_name].y=load_list[l][i][3];
						eval(load_list[l][i][4]);
						app.stage.addChild(objects[obj_name]);	
					break;
					
					case "block":
						eval(load_list[l][i][4]);		
						objects[obj_name].x=load_list[l][i][2];
						objects[obj_name].y=load_list[l][i][3];		
						objects[obj_name].sx=load_list[l][i][2];
						objects[obj_name].sy=load_list[l][i][3];		
						
						app.stage.addChild(objects[obj_name]);	
					break;

					case "sprite_array":
						//var textures=[game_res.resources["expl_0_0"].texture,game_res.resources["expl_0_1"].texture];
						var a_size=load_list[l][i][2];
						objects[obj_name]=[];
						for (var n=0;n<a_size;n++)
						{			
							eval(load_list[l][i][4]);		
							app.stage.addChild(objects[obj_name][n]);							
						}
					break;
					
					case "anim_array":
						objects[obj_name]=[];
						var n=0;
						for (var key in anim_list)
						{
							var textures=[];
							for (var a=0;a<anim_list[key];a++)
								textures.push(game_res.resources[key+"_"+a].texture);						
							
							eval(load_list[l][i][4]);
							app.stage.addChild(objects[obj_name][n]);								
							n++;
						}

					break;
				}
			}
		}
		
		
		
		screen_0=new screen_0_class(0);
		screen_1=new screen_1_class(1);
		screen_2=new screen_2_class(2);
		screen_3=new screen_3_class(3);
				
		screen_0.draw_and_init();
		
		main_loop();	
	}

	function progress(loader, resource)
	{
		document.getElementById("myBar").style.width =  Math.round(loader.progress)+"%";
	}
	
}

function main_loop()
{
	g_process();
    app.render(app.stage);
	requestAnimationFrame(main_loop);
}


