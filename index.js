var PI=3.1415926535, M_WIDTH=450, M_HEIGHT=800, game_tick;
var app, game_res, game_tick=0, g_spd=5, objects={}, baloons=[], a_cnt=20
var screen_0, screen_1, screen_2, screen_3;

var level=0;
var arrows=20;
var life=3;
var prv_baloon_send=0;
var baloons_sent=0;
var baloons_cnt=10;
var arrows_cnt=20;
var arrow_send_time=0;
var bursted_baloons=0;
var passed_baloons=0;
var sec_check=0;
var game_ended=false;

g_process=function(){};



var path=[[-10,170],[120,170],[190,200],[215,240],[180,270],[90,280],[50,330],[40,410],[40,540],[70,630],[140,680],[220,700],[295,700],[360,670],[400,620],[420,550],[430,420],[410,310],[350,270],[300,260],[280,235],[290,200],[350,170],[470,170]];


var l_info=[[10,20,3,0],[12,21,3,0.02],[14,22,3,0.04],[16,23,3,0.06],[18,24,3,0.08],[20,25,3,0.1],[22,26,3,0.12],[24,27,3,0.14],[26,28,3,0.16],[28,29,3,0.18],[30,30,3,0.2],[32,31,3,0.22],[34,32,3,0.24],[36,33,3,0.26],[38,34,3,0.28],[40,35,3,0.3],[42,36,3,0.32],[44,37,3,0.34],[46,38,3,0.36],[48,39,3,0.38],[50,40,3,0.4],[52,41,3,0.42],[54,42,3,0.44],[56,43,3,0.46],[58,44,3,0.48]];



//это бонусы стрел после уровня
arrows_as_bonus=0;

//сосотяния шара
b_simple=0;
b_bonus_arrows=1;
b_bonus_slow=2;
b_brick=3;
b_bonus_hand=4;




var on_start=false;

//анимации
const a_in=0;
const a_out=1;
const a_in_bounce=2;
const a_in_elastic=3;

const a_pos=0;
const a_scale=1;

class anim_class
{
	
	constructor()
	{		
		this.anim_array=[[],[],[],[],[],[],[],[],[],[],[],[],[],[]];		
		this.start_time=[];
		this.delta=[];
		


	}
		
	f_in(x)
	{
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
	}
	
	f_out(x)
	{
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return c3 * x * x * x - c1 * x * x;
	}
	
	f_in_bounce(x)
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
		
	f_in_elastic(x)
	{
	const c4 = (2 * Math.PI) / 3;

	return x === 0
	? 0
	: x === 1
	? 1
	: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
	}
	
	add_anim_scale(spr,anim,start,spd,hide_on_end=false)
	{
		//ищем свободный слот для анимации
		for (var i=0;i<this.anim_array.length;i++)
		{
			if (this.anim_array[i].length==0)
			{
			
				var func=0;
				switch (anim)
				{					
					case a_in:					
					func=this.f_in;
					break;
					
					case a_out:
					func=this.f_out;
					break;		

					case a_in_bounce:
					func=this.f_in_bounce;
					break;	
					
					case a_in_elastic:
					func=this.f_in_elastic;
					break;						
				}				
				
				//включаем видимость
				spr.visible=true;
				
				//вторым параметром записываем прямо ссылку на функцию
				this.anim_array[i]=[a_scale,spr,func,start,spd,hide_on_end]
				return;
			}
		}
	}
		
	add_anim_in_pos(spr,anim,dx,dy,spd)
	{
		//ищем свободный слот для анимации
		for (var i=0;i<this.anim_array.length;i++)
		{
			if (this.anim_array[i].length==0)
			{
			
				var func=0;
				switch (anim)
				{					
					case a_in:					
					func=this.f_in;
					break;
					
					case a_out:
					func=this.f_out;
					break;		

					case a_in_bounce:
					func=this.f_in_bounce;
					break;	
					
					case a_in_elastic:
					func=this.f_in_elastic;
					break;						
				}				
				
				//включаем видимость
				spr.visible=true;
				
				//вторым параметром записываем прямо ссылку на функцию
				this.anim_array[i]=[a_pos,spr,func,0,spr.sx+dx,spr.sy+dy,-dx,-dy,spd,false]
				return;
			}
		}
	}
		
	add_anim_out_pos(spr,anim,tar_x,tar_y,spd)
	{
		//ищем свободный слот для анимации
		for (var i=0;i<this.anim_array.length;i++)
		{
			if (this.anim_array[i].length==0)
			{
			
				var func=0;
				switch (anim)
				{					
					case a_in:					
					func=this.f_in;
					break;
					
					case a_out:
					func=this.f_out;
					break;		

					case a_in_bounce:
					func=this.f_in_bounce;
					break;	
					
					case a_in_elastic:
					func=this.f_in_elastic;
					break;						
				}				
				
				
				//вторым параметром записываем прямо ссылку на функцию
				var dx=tar_x-spr.x;
				var dy=tar_y-spr.y;
				
				
				//выключаем видимость при завершении
				this.anim_array[i]=[a_pos,spr,func,0,spr.x,spr.y,dx,dy,spd,true]
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
				//это анимации чисто позиций
				if (this.anim_array[i][0]===a_pos)
				{
					if (this.anim_array[i][3]<1)
					{	
						this.anim_array[i][1].x=this.anim_array[i][4]+this.anim_array[i][6]*this.anim_array[i][2](this.anim_array[i][3]);
						this.anim_array[i][1].y=this.anim_array[i][5]+this.anim_array[i][7]*this.anim_array[i][2](this.anim_array[i][3]);
						this.anim_array[i][3]+=this.anim_array[i][8];		
					}
					else
					{
						if (this.anim_array[i][9]==true)
							this.anim_array[i][1].visible=false;
						this.anim_array[i]=[];
						
					}		
				}
				
				//это анимации чисто масштаба
				if (this.anim_array[i][0]===a_scale)
				{
					if (this.anim_array[i][3]<=1 && this.anim_array[i][3]>=0)
					{	
						this.anim_array[i][1].scale.x=this.anim_array[i][2](this.anim_array[i][3]);
						this.anim_array[i][1].scale.y=this.anim_array[i][2](this.anim_array[i][3]);
						this.anim_array[i][3]+=this.anim_array[i][4];		
					}
					else
					{
						if (this.anim_array[i][5]==true)
							this.anim_array[i][1].visible=false;
						this.anim_array[i]=[];						
					}		
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
		this.visible=true;
		
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
			decrease_life();
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
		if (game_tick>this.sec_check+60)
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
			if (game_tick>this.slow_down_start+180)
			{
				this.is_slow_down=false;
				this.spd=1.5;				
			}		
		}
		
		//превращаем бонусные шары в обычные
		if (this.type==b_bonus_arrows || this.type==b_bonus_slow)
		{
			if (game_tick>this.bonus_time+240)
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
		
		//функция процессинга
		this.init_parameters=true;
		g_process=this.process.bind(this);
	}
	
	process()
	{
		
		//инициируем все показатели
		if (this.init_parameters==true)
		{	
			c.add_anim(objects.baloon5,a_bounce,250,-50,250,250,0.01);
			c.add_anim(objects.bow5,a_elastic,objects.bow5.sx-200,objects.bow5.sy+50,objects.bow5.sx,objects.bow5.sy,0.01);
			this.init_parameters=false;
		}
		
		
		objects.bow5.rotation=(Math.sin(game_tick))*0.8+0.8;
		objects.baloon5.y=200+(Math.sin(game_tick*2))*50;
		game_tick += 0.01666666;
		
		//обработка анимации
		c.process();
		
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
				
				eval(load_list[this.id][i][5]);
			}
			
			if (obj_class=="array" ) 
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
		this.arrows_cnt=l_info[level][1]+arrows_as_bonus;
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
	
			//вылет уровня
			c.add_anim(objects.level_note,a_out_back,450,objects.level_note.sy,objects.level_note.sx,objects.level_note.sy,0.01);
	
			//убираем все остальное
			c.add_anim(objects.win,a_in_back,objects.win.sx,objects.win.sy,objects.win.sx-500,objects.win.sy,0.02,false);
	
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
		
		//обновляем анимации
		c.process();
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
			
			if ((bursted_baloons+passed_baloons)==baloons_cnt && game_ended==false)
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
			
		
		//обновляем анимации
		c.process();
		
		game_tick += 0.01666666*g_spd;	
	}	

	process_win()
	{
		
		//инициируем все показатели
		if (this.init_parameters==true)
		{	
			level++;	
			objects.win.visible=true;
			
						
			//вылет обозначения
			c.add_anim(objects.win,a_out_back,objects.win.sx+500,objects.win.sy,objects.win.sx,objects.win.sy,0.05);
			
			
			if(this.passed_baloons==2)
			{
				objects.star1.visible=true;				
				c.add_anim(objects.star1,a_bounce,objects.star1.sx,-50,objects.star1.sx,objects.star1.sy,0.01);
				
				objects.bonus.visible=true;				
				objects.bonus.texture=game_res.resources['bonus_1'].texture;
				c.add_anim(objects.bonus,a_elastic,-50,objects.bonus.sy,objects.bonus.sx,objects.bonus.sy,0.02);
				
				arrows_as_bonus=1;
			}			
			
			if(this.passed_baloons==1)
			{
				objects.star1.visible=true;				
				c.add_anim(objects.star1,a_bounce,objects.star1.sx,-50,objects.star1.sx,objects.star1.sy,0.01);
				
				objects.star2.visible=true;
				c.add_anim(objects.star2,a_bounce,objects.star2.sx,-50,objects.star2.sx,objects.star2.sy,0.015);
				
				objects.bonus.visible=true;				
				objects.bonus.texture=game_res.resources['bonus_5'].texture;
				c.add_anim(objects.bonus,a_elastic,-50,objects.bonus.sy,objects.bonus.sx,objects.bonus.sy,0.02);
				
				arrows_as_bonus=5;
			}			
			
			if(this.passed_baloons==0)
			{
				objects.star1.visible=true;				
				c.add_anim(objects.star1,a_bounce,objects.star1.sx,-50,objects.star1.sx,objects.star1.sy,0.01);
				
				objects.star2.visible=true;
				c.add_anim(objects.star2,a_bounce,objects.star2.sx,-50,objects.star2.sx,objects.star2.sy,0.015);
				
				objects.star3.visible=true;
				c.add_anim(objects.star3,a_bounce,objects.star3.sx,-50,objects.star3.sx,objects.star3.sy,0.02);
				
				objects.bonus.visible=true;				
				objects.bonus.texture=game_res.resources['bonus_10'].texture;
				c.add_anim(objects.bonus,a_elastic,-50,objects.bonus.sy,objects.bonus.sx,objects.bonus.sy,0.02);
				
				arrows_as_bonus=10;
			}				


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
			arrows_as_bonus=0;
			
			//вылет обозначения
			c.add_anim(objects.game_over,a_out_back,objects.game_over.sx-500,objects.game_over.sy,objects.game_over.sx,objects.game_over.sy,0.01);
			
			objects.game_over.visible=true;				
			game_ended=true;
		}
	
		if ((bursted_baloons+this.passed_baloons)==this.baloons_cnt && game_ended==false)
		{				
			game_ended=true;				
			g_process=this.process_win.bind(this);
			this.init_parameters=true;
		}
		
		game_tick += 0.01666666*g_spd;	
					
		//обновляем анимации
		c.process();
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
			
			if (obj_class=="array" ) 
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
			
			if (obj_class=="array" ) 
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

function send_baloon()
{		
	
	for (var i=0;i<objects.baloons.length;i++)
	{
		if (objects.baloons[i].visible==false)
		{

			objects.baloons[i].send(0.1);						
			prv_baloon_send=game_tick;	
			baloons_sent++;				

			return;
		}			
	}
}

function send_arrow()
{
	if (arrows_cnt===0)
		return;
	
	//запоминаем время выстрела
	arrow_send_time=game_tick;
	
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
	
	arrows_cnt--;

	//обновляем инфор о количестве стрел
	objects.arrows_info_text.text="x"+arrows_cnt
	

}
				
function decrease_life()
{
	life--;
	if (life<0)
		life=0;
	objects.life_info.text="x"+this.life;
	passed_baloons++;
}
	
//заставка игры
function process_1()
{
	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		//рисуем объекты с выходом соответсвующей анимацией
		objects.bcg5.visible=true;
		c.add_anim_in_pos(objects.game_name,	a_in,	dx=-0,		dy=-150,0.01);		
		c.add_anim_in_pos(objects.baloon5,		a_in,	dx=+200,	dy=0,0.01);		
		c.add_anim_in_pos(objects.bow5,			a_in,	dx=-200,	dy=0,0.01);		
		c.add_anim_in_pos(objects.button_1,		a_in,	dx=0,		dy=+80,0.01);
		
		//кнопка пока не активна
		objects.button_1.interactive=false;
		
		//другие инициализации
		game_tick=0;
		on_start=false;
	}
			
		
	//после того как все завершилось активируем кнопку
	if (game_tick===100)
		objects.button_1.interactive=true;		

	
	//тик
	game_tick++;
	
	//анимация
	c.process();
	
}

//быстрая загрузка уровня
function process_2()
{
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		
		//убираем ненужные объекты
		c.add_anim_out_pos(objects.game_name,	a_out,objects.game_name.x,		objects.game_name.y-200			,0.05,true);		
		c.add_anim_out_pos(objects.baloon5,		a_out,objects.baloon5.x+300,	objects.baloon5.y				,0.02,true);		
		c.add_anim_out_pos(objects.bow5,		a_out,objects.bow5.x-300,		objects.bow5.y					,0.02,true);		
		c.add_anim_out_pos(objects.button_1,	a_out,objects.button_1.x,		objects.button_1.y+160			,0.02,true);
		c.add_anim_out_pos(objects.game_over,	a_out,objects.game_over.x+400,	objects.game_over.y				,0.02,true);
		
		//c.add_anim_out_scale(objects.game_over,	a_out,objects.game_over.x+400,	objects.game_over.y				,0.02,true);
		
		
		objects.level_note.text="Level "+level;
		objects.arrows_info_text.text="x"+arrows;
		objects.life_info.text="x"+life;
	
		//сначала выключаем все шары которые возможно остались от предыдущих игр
		objects.baloons.forEach(e=>e.visible=false);	
		baloons_sent=0;
		prv_baloon_send=0;
	
		//другие инициализации
		g_spd=5;
		game_tick=0;
		on_start=false;
	}


	//после того как все завершилось
	if (game_tick===60)
	{
		//включаем нужные объекты
		c.add_anim_in_pos(objects.arrows_info_3,		a_in,	dx=0,		dy=-100,	0.01);		
		c.add_anim_in_pos(objects.heart_icon,			a_in,	dx=0,		dy=-100,	0.01);
		c.add_anim_in_pos(objects.arrows_info_text,		a_in,	dx=0,		dy=-100,	0.01);		
		c.add_anim_in_pos(objects.life_info,			a_in,	dx=0,		dy=-100,	0.01);	
		c.add_anim_in_pos(objects.level_note,			a_in,	dx=-400,	dy=0,		0.01);	
		
		c.add_anim_in_pos(objects.arrow,		a_in,	dx=-400,		dy=0,	0.02);	
		c.add_anim_in_pos(objects.bow,			a_in,	dx=400,			dy=0,	0.02);	
	}
	
	//крутим лук и стрелу
	objects.bow.rotation+=0.05*g_spd;
	objects.arrow.rotation+=0.05*g_spd;		


	//добавляем шары
	if (baloons_sent<baloons_cnt)
	{
		if(game_tick>prv_baloon_send+60/g_spd)
		{
			send_baloon();		
		}			
	}

	//обрабатываем шары
	objects.baloons.forEach(e=>e.process());


	//завершаем через некоторое время
	if(game_tick===100)
	{
		
		
		g_process=process_3;
		on_start=true;
	}

	//тик
	game_tick++;
	
	//анимация
	c.process();
	
}

//это нормальная игра
function process_3()
{
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		
		g_spd=1;
		game_ended=false;
		life=3;
		objects.life_info.text="x"+life;
		sec_check=0;
		passed_baloons=0;
		bursted_baloons=0;
		arrows_cnt=10;
		objects.arrows_info_text.text="x"+arrows;
	
		//активируем нажатие на лук
		objects.bow.pointerdown=function(){send_arrow();};
	
		//другие инициализации
		on_start=false;
	}

	
	//крутим лук и стрелу
	objects.bow.rotation+=0.05*g_spd;
	objects.arrow.rotation+=0.05*g_spd;		


	//добавляем шары
	if (baloons_sent<baloons_cnt)
	{
		if(game_tick>prv_baloon_send+60/g_spd)
		{
			send_baloon();		
		}			
	}

	//обрабатываем шары
	objects.baloons.forEach(e=>e.process());

	//обрабатываем стрелки
	objects.arrows.forEach(e=>e.process());

	//возвращаем назад стрелу
	if (objects.arrow.visible===false)
	{
		if (game_tick>arrow_send_time+12)
		{
			objects.arrow.visible=true;
			objects.arrow.rotation=objects.bow.rotation;
			objects.bow.texture=game_res.resources['bow'].texture;
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
								//this.add_arrows(3);		
								bursted_baloons++;							
							break;
							
							case b_bonus_slow:
								objects.baloons[i].visible=false;	
								//this.slow_baloons();
								bursted_baloons++;								
							break;
							
							case b_bonus_hand:
								objects.baloons[i].visible=false;	
								//this.hand_play=true;
								//this.hand_play_start=game_tick;
								//objects.bcg.pointerdown=screen_1.send_arrow_by_hand.bind(this);
								bursted_baloons++;								
							break;
							
						}
					}					
				}
			}
		}
	}

	//секундная проверка событий
	if (game_tick>sec_check+60)
	{
		if (life==0 && game_ended==false)
		{
			game_ended=true;				
			g_process=process_6;
			on_start=true;
			return;
		}
		
		if ((bursted_baloons+passed_baloons)==baloons_cnt && game_ended==false)
		{			
			game_ended=true;				
			g_process=process_5;
			on_start=true;
			return;
		}
		
		if (arrows_cnt==0 && game_ended==false)
		{
			g_process=process_4;
			on_start=true;
			return;
		}
		
		sec_check=game_tick;
	}

	//тик
	game_tick++;
	
	//анимация
	c.process();
	
}

//это эпизод с отуствием стрел
function process_4()
{	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		
		g_spd=5;	
	
	
		//другие инициализации
		on_start=false;
	}
	
	//крутим лук и стрелу
	objects.bow.rotation+=0.05*g_spd;
	objects.arrow.rotation+=0.05*g_spd;		
	
	//обрабатываем шары
	objects.baloons.forEach(e=>e.process());

	//обрабатываем стрелки
	objects.arrows.forEach(e=>e.process());	
	
	
	//обрабатываем событие выигрыша или проигрыша
	if (life==0 && game_ended==false)
	{
		game_ended=true;				
		g_process=process_6;
		on_start=true;
		return;
	}
	
	if ((bursted_baloons+passed_baloons)==baloons_cnt && game_ended==false)
	{			
		game_ended=true;				
		g_process=process_5;
		on_start=true;
		return;
	}
		
	
}

//это эпизод выигрыша
function process_5()
{	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		
		
		
		//убираем ненужные объекты
		c.add_anim_out_pos(objects.arrow,		a_out,objects.arrow.x+300,		objects.arrow.y					,0.02,true);		
		c.add_anim_out_pos(objects.bow,			a_out,objects.bow.x-300,		objects.bow.y					,0.02,true);	
	
		//добавляем новые объекты
		c.add_anim_in_pos(objects.win,			a_in,-500,	0	,0.02,true);
		
		c.add_anim_in_pos(objects.star1,			a_in_bounce,0,	-500	,0.01,true);
		c.add_anim_in_pos(objects.star2,			a_in_bounce,0,	-500	,0.015,true);
		c.add_anim_in_pos(objects.star3,			a_in_bounce,0,	-500	,0.02,true);
	
	
		//другие инициализации
		on_start=false;
	}
	
	
	//обрабатываем стрелки
	objects.arrows.forEach(e=>e.process());	
	
	//тик
	game_tick++;
	
	//анимация
	c.process();
	
}

//это эпизод проигрыша
function process_6()
{	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{		
		
		//убираем ненужные объекты
		c.add_anim_out_pos(objects.arrow,		a_out,objects.arrow.x+300,		objects.arrow.y					,0.02,true);		
		c.add_anim_out_pos(objects.bow,			a_out,objects.bow.x-300,		objects.bow.y					,0.02,true);	
	
		//добавляем новые объекты
		c.add_anim_in_pos(objects.game_over,			a_in,-500,	0	,0.02,true);
	
	
		//другие инициализации
		on_start=false;
		
		//сбрасываем счетчик
		game_tick=0;
	}
	
	
	//показываем кнопку 
	if (game_tick===100)
		c.add_anim_scale(objects.retry_button,	a_in,0,0.02);	
	
	
	//обрабатываем стрелки
	objects.arrows.forEach(e=>e.process());	
	
	//обрабатываем шары
	objects.baloons.forEach(e=>e.process());
	
	//тик
	game_tick++;
	
	//анимация
	c.process();
	
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

					case "array":
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
				//screen_0=new screen_0_class(0);
				//screen_1=new screen_1_class(1);
				//screen_2=new screen_2_class(2);
				////screen_3=new screen_3_class(3);				
				//screen_0.draw_and_init();
				
				g_process=process_1;
				on_start=true;
				
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


