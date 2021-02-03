var PI=3.1415926535, M_WIDTH=450, M_HEIGHT=800, game_tick;
var app, game_res, game_tick=0, g_spd=5, objects={}, baloons=[], a_cnt=20, level=0, bursted_baloons=0, game_ended=false;
var screen_0, screen_1, screen_2, screen_3;
g_process=function(){};



var path=[[],[]];
path[0]=[[-10,200],[126,199],[300,240],[370,275],[410,330],[420,465],[410,590],[380,640],[320,680],[220,700],[130,680],[70,640],[40,580],[30,450],[40,330],[90,280],[170,240],[344,199],[470,200]];

path[1]=[[-10,100],[470,100]];


var l_info=[[10,20,5],[12,22,5],[14,24,5],[16,26,5],[18,28,5],[20,30,6],[22,32,6],[24,34,6],[26,36,6],[28,38,6],[30,40,7],[32,42,7],[34,44,7],[36,46,7],[38,48,7],[40,50,8],[42,52,8],[44,54,8],[46,56,8],[48,58,8],[50,60,9],[52,62,9],[54,64,9],[56,66,9],[58,68,9]];


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
		this.type=0;
		this.is_slow_down=false;
		this.slow_down_start=0;
		
		this.path_id=0;
		
		this.tar_x=0;
		this.tar_y=0;
	}
	
	send(type)
	{			
	
		this.type=type;
		if (type==0)
		{
			this.texture=game_res.resources['baloon'].texture;	
			this.path_id=0;			
		}

		if (type==1)
		{
			this.texture=game_res.resources['baloon_bonus_arrows'].texture;		
			this.path_id=1;				
		}

		if (type==2)
		{
			this.texture=game_res.resources['baloon_bonus_slow'].texture;	
			this.path_id=1;				
		}
	
	
		this.x=path[this.path_id][0][0];
		this.y=path[this.path_id][0][1];
		this.visible=true;
		this.tar_node=0;
		this.dx=0;
		this.dy=0;
		this.spd=1.5;
		this.is_slow_down=false;
		this.slow_down_start=0;
		
		this.total_path_len=this.total_path();

		this.retarget();	

	}
		
	total_path()
	{
		
        var dist_on_path = 0;
        for (var p = 0; p < path[this.path_id].length - 1; p++)
		{
			var dx = path[this.path_id][p + 1][0] - path[this.path_id][p][0];
			var dy = path[this.path_id][p + 1][1] - path[this.path_id][p][1];
			var d = Math.sqrt(dx * dx + dy * dy);
			dist_on_path += d;
        }
		return dist_on_path;
		
	}	
		
	dist_traveled()
	{
        var dist_on_path = 0;
        for (var p = 0; p < path[this.path_id].length - 1; p++)
		{
            if (p == (this.tar_node - 1))
			{
                var dx = this.x - path[this.path_id][p][0];
                var dy = this.y - path[this.path_id][p][1];
                var d = Math.sqrt(dx * dx + dy * dy);
                dist_on_path += d;
                return dist_on_path;
            }
            else
			{
                var dx = path[this.path_id][p + 1][0] - path[this.path_id][p][0];
                var dy = path[this.path_id][p + 1][1] - path[this.path_id][p][1];
                var d = Math.sqrt(dx * dx + dy * dy);
                dist_on_path += d;
            }
        }
    }
		
	slow_down()
	{
		
		this.spd=0.5;
		this.is_slow_down=true;
		this.slow_down_start=game_tick;
		
	}
	
	retarget()
	{
		this.tar_node++;		
		if (this.tar_node==path[this.path_id].length)
		{
			if (this.type==0)
				screen_1.decrease_life();
			this.visible=false;			
			return;
		}

		this.tar_x=path[this.path_id][this.tar_node][0]+Math.random()*20-10;
		this.tar_y=path[this.path_id][this.tar_node][1]+Math.random()*20-10;
		
		var dx=this.tar_x-this.x;
		var dy=this.tar_y-this.y;
		var d=dx*dx+dy*dy;
		d=Math.sqrt(d);
		this.dx=dx/d;
		this.dy=dy/d;		
	}
	
	process()
	{				
		if (this.visible==false)
			return;
		
		
		
		//подсвечиваем в зависимости от пройденного пути
		var d_traveled=this.dist_traveled();
		var k=d_traveled/this.total_path_len;
		this.tint=PIXI.utils.rgb2hex([k, k, k]);
		
		//проверяем завершение замедления
		if (this.is_slow_down==true)
		{
			if (game_tick>this.slow_down_start+3)
			{
				this.is_slow_down=false;
				this.spd=1.5;				
			}		
		}
		
		this.x+=this.dx*this.spd*g_spd;
		this.y+=this.dy*this.spd*g_spd;
		
		var dx=this.tar_x-this.x;
		var dy=this.tar_y-this.y;
		var d=dx*dx+dy*dy;
		d=Math.sqrt(d);
		if (d<(this.spd*g_spd+0.1))
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
			this.x+=this.dx*10*g_spd;
			this.y+=this.dy*10*g_spd;
			
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
		
		
		g_process=this.process.bind(this);
	}
	
	process()
	{
		objects.bow5.rotation=(Math.sin(game_tick))*0.8+0.8;
		objects.baloon5.y=200+(Math.sin(game_tick*2))*50;
		game_tick += 0.01666666;
		
	}	
}

class screen_1_class
{
	constructor(id)
	{
		this.id=id;
		this.last_send_time=0;
	}
	
	send_baloon(bonus=false)
	{		
		
		for (var i=0;i<objects.baloons.length;i++)
		{
			if (objects.baloons[i].visible==false)
			{
				
				if (bonus==true)
				{
					var r_num=Math.random();
					
					if (r_num>0.5)
						objects.baloons[i].send(1);					
					else
						objects.baloons[i].send(2);						
				}
				else
				{
					objects.baloons[i].send(0);		
					this.prv_baloon_send=game_tick;	
					this.baloons_sent++;
				}				

				return;
			}			
		}
	}
	
	slow_baloons()
	{
		
		objects.baloons.forEach(e=>e.slow_down());
		
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
				
		//функция процессинга
		g_process=this.process_init.bind(this);
		
		//секундная проверка событий
		this.sec_check=1;
				
	
		//карта событий
		this.event_id=0;
		this.events=[
		[999999,"alert('long game'"]		
		];
		g_spd=5;
		game_tick = 0;
		game_ended=false;
		bursted_baloons=0;
		this.passed_baloons=0;
		
		this.baloons_sent=0;
		
		//время когда предыдущий шар был выпущен
		this.prv_baloon_send=game_tick;
		
		//время когда предыдущий бонус был выпущен
		this.prv_bonus_time=game_tick;
		
		//устанавливаем количество шаров в уровне
		this.baloons_cnt=l_info[level][0];
		
		//устанавливаем начальное количество стрелки
		this.arrows_cnt=l_info[level][1];
		objects.arrows_info_text.text="X"+this.arrows_cnt
		
		//обозначаем уровень		
		objects.level_note.text="Level "+level;
		
		//устанавливаем количество жизней
		this.life=l_info[level][2];
		objects.life_info.text="X"+this.life;
	}
	
	send_arrow()
	{
		if (this.arrows_cnt==0)
			return;
		
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
		
		this.arrows_cnt--;

		//обновляем инфор о количестве стрел
		objects.arrows_info_text.text="X"+this.arrows_cnt
		

	}
			
	decrease_life()
	{
		this.life--;
		if (this.life<0)
			this.life=0;
		objects.life_info.text="X"+this.life;
		this.passed_baloons++;
	}
	
	process_init()
	{
		
		//крутим дартц
		objects.bow.rotation-=0.05*g_spd;
		objects.arrow.rotation-=0.05*g_spd;
		
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
		
		//добавляем шары
		if (this.baloons_sent<this.baloons_cnt)
		{
			if(game_tick>this.prv_baloon_send+0.7)
			{
				this.send_baloon();	
			}			
		}
	
		
		game_tick += 0.01666666*g_spd;	
		
		
		if (game_tick/g_spd>1)
		{
			g_spd=1;
			
			//включаем нажимание кнопки
			objects.bcg.pointerdown=function(){screen_1.send_arrow()};
			g_process=this.process.bind(this);
			
		}
		
	}
	
	add_arrows(cnt)
	{
		this.arrows_cnt+=cnt;
		objects.arrows_info_text.text="X"+this.arrows_cnt
	}
	
	process()
	{
		
		//крутим дартц
		objects.bow.rotation-=0.05*g_spd;
		objects.arrow.rotation-=0.05*g_spd;
		
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


		//секундная проверка событий
		if (game_tick>this.sec_check)
		{
			this.sec_left--;
			
			
			if (this.life==0 && game_ended==false)
			{
				objects.game_over.visible=true;				
				game_ended=true;
			}
			
			if ((bursted_baloons+this.passed_baloons)==this.baloons_cnt && game_ended==false)
			{				
				objects.win.visible=true;
				level++;
				game_ended=true;
			}
			
			if (this.arrows_cnt==0 && game_ended==false)
			{
				objects.bcg.pointerdown=null;
				g_spd=5;
				g_process=this.process_finish.bind(this);
			}
			
			
			this.sec_check++;
		}

		//добавляем обычные шары
		if (this.baloons_sent<this.baloons_cnt)
		{
			if(game_tick/g_spd>this.prv_baloon_send+0.7)
			{
				this.send_baloon();		
			}			
		}


		//добавляем бонусы в соответствующее время
		if(game_tick>this.prv_bonus_time+6)
		{
			
			this.send_baloon(true);		
			this.prv_bonus_time=game_tick;
		}

		
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
							if (objects.baloons[i].type==0)
								bursted_baloons++;							
							if (objects.baloons[i].type==1)
								this.add_arrows(3);
							if (objects.baloons[i].type==2)
								this.slow_baloons();
							
							
						}					
					
					}
				}
			}
		}
			
		
		
		game_tick += 0.01666666*g_spd;	
	}	

	process_finish()
	{
		
		//крутим дартц
		objects.bow.rotation-=0.05*g_spd;
		objects.arrow.rotation-=0.05*g_spd;
		
		//обрабатываем шары
		objects.baloons.forEach(e=>e.process());
		
		//обрабатываем стрелки
		objects.arrows.forEach(e=>e.process());
		
		
		if (this.life==0 && game_ended==false)
		{
			objects.game_over.visible=true;				
			game_ended=true;
		}
	
		if ((bursted_baloons+this.passed_baloons)==this.baloons_cnt && game_ended==false)
		{				
			objects.win.visible=true;
			level++;
			game_ended=true;
		}
		
		game_tick += 0.01666666*g_spd;	
					
		
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
		app.renderer.autoResize=true;
		app.renderer.resize(window.innerWidth,window.innerHeight);
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
		
		
		var font = new FontFaceObserver('m_font');
		font.load().then(
			function ()
			{
				screen_0=new screen_0_class(0);
				screen_1=new screen_1_class(1);
				screen_2=new screen_2_class(2);
				screen_3=new screen_3_class(3);				
				screen_0.draw_and_init();
				main_loop();
			},
			function ()
			{
				alert('Font is not available');
			}
		);
	
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


