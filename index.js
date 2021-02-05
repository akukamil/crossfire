var PI=3.1415926535, M_WIDTH=450, M_HEIGHT=800, game_tick;
var app, game_res, game_tick=0, g_spd=5, objects={}, baloons=[], a_cnt=20, level=0, bursted_baloons=0, game_ended=false;
var screen_0, screen_1, screen_2, screen_3;
g_process=function(){};



var path=[[-10,170],[120,170],[190,200],[215,240],[180,270],[90,280],[50,330],[40,410],[40,540],[70,630],[140,680],[220,700],[295,700],[360,670],[400,620],[420,550],[430,420],[410,310],[350,270],[300,260],[280,235],[290,200],[350,170],[470,170]];


var l_info=[[10,20,5,0],[12,22,5,0.02],[14,24,5,0.04],[16,26,5,0.06],[18,28,5,0.08],[20,30,6,0.1],[22,32,6,0.12],[24,34,6,0.14],[26,36,6,0.16],[28,38,6,0.18],[30,40,7,0.2],[32,42,7,0.22],[34,44,7,0.24],[36,46,7,0.26],[38,48,7,0.28],[40,50,8,0.3],[42,52,8,0.32],[44,54,8,0.34],[46,56,8,0.36],[48,58,8,0.38],[50,60,9,0.4],[52,62,9,0.42],[54,64,9,0.44],[56,66,9,0.46],[58,68,9,0.48]];



//сосотяния шара
b_simple=0;
b_bonus_arrows=1;
b_bonus_slow=2;
b_brick=3;
b_bonus_hand=4;

class anim_class
{
	
	constructor()
	{		
		this.anim_array=[[],[],[],[],[],[],[],[],[],[],[],[],[],[]];		
		this.start_time=[];
		this.delta=[];
		
		const a_bounce=0;


	}
	
	//это анимация прыгания
	bounce(x)
	{
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1)
		{
			return n1 * x * x;
		} 
		else if (x < 2 / d1)
		{
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		}
		else if (x < 2.5 / d1)
		{
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		}
		else
		{
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	}
	
	add_bounce(spr,y_start,y_end,spd)
	{		
		//ищем свободный слот для анимации
		for (var i=0;i<this.anim_array.length;i++)
		{
			if (this.anim_array[i].length==0)
			{
				var delta=y_end-y_start;
				this.anim_array[i]=[spr,y_start,delta,0,spd]
				return;
			}
		}	
	}
	
	process()
	{
		for (var i=0;i<this.anim_array.length;i++)
		{
			if (this.anim_array[i].length!=0)
			{
								
				if (this.anim_array[i][3]<1)
				{	
					this.anim_array[i][0].y=this.anim_array[i][1]+this.bounce(this.anim_array[i][3])*this.anim_array[i][2];			
					this.anim_array[i][3]+=this.anim_array[i][4];			
				}
				else
				{
					this.anim_array[i]=[];
				}			
			}
		}
	}
	
}


//это анимации
c = new anim_class();

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
		this.type=b_simple;
		this.is_slow_down=false;
		this.slow_down_start=0;
		
		this.sec_check=0;
		
		this.tar_x=0;
		this.tar_y=0;
	}
	
	send(brick_prob)
	{			
	
		if (Math.random()<brick_prob)
		{
			this.type=b_brick;
			this.texture=game_res.resources['brick_baloon'].texture;			
		}
		else
		{
			this.type=b_simple;
			this.texture=game_res.resources['baloon'].texture;		
		}
			
		


		this.x=path[0][0];
		this.y=path[0][1];
		this.visible=true;
		this.tar_node=0;
		this.dx=0;
		this.dy=0;
		this.spd=1.5;
		this.is_slow_down=false;
		this.slow_down_start=0;
		
		this.sec_check=game_tick;
		this.send_time=game_tick;
		this.bonus_time=0;
		
		//this.total_path_len=this.total_path();

		this.retarget();	
	}
	
	/*
	total_path()
	{
		
        var dist_on_path = 0;
        for (var p = 0; p < path.length - 1; p++)
		{
			var dx = path[p + 1][0] - path[p][0];
			var dy = path[p + 1][1] - path[p][1];
			var d = Math.sqrt(dx * dx + dy * dy);
			dist_on_path += d;
        }
		return dist_on_path;
		
	}	
		
	dist_traveled()
	{
        var dist_on_path = 0;
        for (var p = 0; p < path.length - 1; p++)
		{
            if (p == (this.tar_node - 1))
			{
                var dx = this.x - path[p][0];
                var dy = this.y - path[p][1];
                var d = Math.sqrt(dx * dx + dy * dy);
                dist_on_path += d;
                return dist_on_path;
            }
            else
			{
                var dx = path[p + 1][0] - path[p][0];
                var dy = path[p + 1][1] - path[p][1];
                var d = Math.sqrt(dx * dx + dy * dy);
                dist_on_path += d;
            }
        }
    }
	*/
	
	slow_down()
	{
		
		this.spd=0.5;
		this.is_slow_down=true;
		this.slow_down_start=game_tick;
		
	}
	
	retarget()
	{
		this.tar_node++;		
		if (this.tar_node==path.length)
		{
			screen_1.decrease_life();
			this.visible=false;			
			return;
		}

		this.tar_x=path[this.tar_node][0]+Math.random()*20-10;
		this.tar_y=path[this.tar_node][1]+Math.random()*20-10;
		
		var dx=this.tar_x-this.x;
		var dy=this.tar_y-this.y;
		var d=dx*dx+dy*dy;
		d=Math.sqrt(d);
		this.dx=dx/d;
		this.dy=dy/d;		
	}
	
	turn_to_simple()
	{
		
		this.type=b_simple;
		this.texture=game_res.resources['baloon'].texture;	
		
	}
	
	process()
	{				
		if (this.visible==false)
			return;
		
		
		//секундная проверка и превращение в бонусы
		if (game_tick>this.sec_check+1)
		{			
			if (this.type==b_simple)
			{
				if (Math.random()>0.97)
				{
					
					var r_int=Math.floor(Math.random() * 3);
					
					switch(r_int)
					{
						
						case 0:
						this.type=b_bonus_arrows;
						this.texture=game_res.resources['baloon_bonus_arrows'].texture;	
						break;
						
						
						case 1:
						this.type=b_bonus_slow;
						this.texture=game_res.resources['baloon_bonus_slow'].texture;	
						break;	
						
						
						case 2:
						this.type=b_bonus_hand;
						this.texture=game_res.resources['baloon_bonus_hand'].texture;	
						break;
						
					}


					this.bonus_time=game_tick;
				}			
			}
			this.sec_check=game_tick;
		}
		
		//проверяем завершение замедления
		if (this.is_slow_down==true)
		{
			if (game_tick>this.slow_down_start+3)
			{
				this.is_slow_down=false;
				this.spd=1.5;				
			}		
		}
		
		//превращаем бонусные шары в обычные
		if (this.type==b_bonus_arrows || this.type==b_bonus_slow)
		{
			if (game_tick>this.bonus_time+4)
			{
				this.texture=game_res.resources['baloon'].texture;
				this.type=b_simple;
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
		this.dx=Math.cos(this.rotation);
		this.dy=Math.sin(this.rotation);
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
	}
	
	send_baloon()
	{		
		
		for (var i=0;i<objects.baloons.length;i++)
		{
			if (objects.baloons[i].visible==false)
			{

				objects.baloons[i].send(this.brick_prob);						
				this.prv_baloon_send=game_tick;	
				this.baloons_sent++;				

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
		
		//вероятность кирпичного шара
		this.brick_prob=l_info[level][3];
		
		//обозначаем уровень		
		objects.level_note.text="Level "+level;
		
		//устанавливаем количество жизней
		this.life=l_info[level][2];
		objects.life_info.text="X"+this.life;
		
		//игра рукой
		this.hand_play=false;
		this.hand_play_start=0;
		
		//для бонусов
		this.last_send_time=0;
		this.last_hit=0;
		this.hit_row_size=1;
		
		//функция процессинга
		this.init_parameters=true;
		g_process=this.process_init.bind(this);
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
		
	send_arrow_by_hand(e)
	{
		
		
		if (this.arrows_cnt==0)
			return;
		
		//запоминаем время выстрела
		this.last_send_time=game_tick;
		
		//определяем угол лука
		var x=e.data.global.x/app.stage.scale.x;
		var y=e.data.global.y/app.stage.scale.y;
		
		var dx=x-objects.bow.x;
		var dy=y-objects.bow.y;
		var dir = Math.atan2(dy, dx);
		objects.bow.rotation=dir;
		
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
		//инициируем все показатели
		if (this.init_parameters==true)
		{	
			this.init_parameters=false;
		}
		
		//крутим дартц если это не игра рукой
		if (this.hand_play==false)
		{
			objects.bow.rotation+=0.05*g_spd;
			objects.arrow.rotation+=0.05*g_spd;			
		}

		
		//обрабатываем шары
		objects.baloons.forEach(e=>e.process());
		
		//обрабатываем стрелки
		objects.arrows.forEach(e=>e.process());
		

		//добавляем шары
		if (this.baloons_sent<this.baloons_cnt)
		{
			if(game_tick>this.prv_baloon_send+0.7)
			{
				this.send_baloon();		
			}			
		}
	
		
		game_tick += 0.01666666*g_spd;	
		
		
		//завершаем начальный цикл
		if (game_tick/g_spd>1)
		{
			g_process=this.process.bind(this);	
			this.init_parameters=true;
		}
		
	}
	
	add_arrows(cnt)
	{
		this.arrows_cnt+=cnt;
		objects.arrows_info_text.text="X"+this.arrows_cnt
	}
			
	process()
	{
		
		//инициируем все показатели
		if (this.init_parameters==true)
		{	
			g_spd=1;			
			//включаем нажимание кнопки
			objects.bcg.pointerdown=function(){screen_1.send_arrow()};
			this.init_parameters=false;
		}
		
		
		//крутим дартц если это не игра рукой
		if (this.hand_play==false)
		{
			objects.bow.rotation+=0.05*g_spd;
			objects.arrow.rotation+=0.05*g_spd;			
		}
		else
		{			
			if (game_tick>this.hand_play_start+3)
			{
				objects.bcg.pointerdown=function(){screen_1.send_arrow()};
				this.hand_play=false;	
			}
						
		}
		
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
				game_ended=true;				
				g_process=this.process_win.bind(this);
				this.init_parameters=true;
			}
			
			if (this.arrows_cnt==0 && game_ended==false)
			{
				g_process=this.process_finish.bind(this);
				this.init_parameters=true;
			}
			
			this.sec_check++;
		}

		//добавляем шары
		if (this.baloons_sent<this.baloons_cnt)
		{
			if(game_tick/g_spd>this.prv_baloon_send+0.7)
			{
				this.send_baloon();		
			}			
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
		var hited=0;
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
							
							switch(objects.baloons[i].type)
							{
								
								case b_brick:
									objects.baloons[i].turn_to_simple();
									objects.arrows[k].visible=false;							
								break;
								
								case b_simple:
									objects.baloons[i].visible=false;	
									bursted_baloons++;									
								break;
								
								case b_bonus_arrows:
									objects.baloons[i].visible=false;	
									this.add_arrows(3);		
									bursted_baloons++;							
								break;
								
								case b_bonus_slow:
									objects.baloons[i].visible=false;	
									this.slow_baloons();
									bursted_baloons++;								
								break;
								
								case b_bonus_hand:
									objects.baloons[i].visible=false;	
									this.hand_play=true;
									this.hand_play_start=game_tick;
									objects.bcg.pointerdown=screen_1.send_arrow_by_hand.bind(this);
									bursted_baloons++;								
								break;
								
							}
						}					
					}
				}
			}
		}
			
		
		
		game_tick += 0.01666666*g_spd;	
	}	

	process_win()
	{
		
		//инициируем все показатели
		if (this.init_parameters==true)
		{	
			level++;	
			objects.win.visible=true;
			
			objects.star1.visible=true;
			objects.star2.visible=true;
			objects.star3.visible=true;
			
			c.add_bounce(objects.star1,-50,objects.star1.sy,0.02);
			c.add_bounce(objects.star2,-50,objects.star1.sy,0.015);
			c.add_bounce(objects.star3,-50,objects.star1.sy,0.01);

			this.init_parameters=false;
		}
		

		
		//обновляем анимации
		c.process();
		
		//таймер
		game_tick += 0.01666666*g_spd;			
	}

	process_finish()
	{
		
		//инициируем все показатели
		if (this.init_parameters==true)
		{	
			objects.bcg.pointerdown=null;
			g_spd=5;
			this.init_parameters=false;
		}
		
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


