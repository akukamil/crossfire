var PI=3.1415926535,PI_2=6.283185307, M_WIDTH=450, M_HEIGHT=800, game_tick;
var app, game_res, game_tick=0, g_spd=5, objects={}, baloons=[], a_cnt=20
var screen_0, screen_1, screen_2, screen_3;


var level=0;
var arrows=20;
var life=0;
var prv_baloon_send=0;
var baloons_sent=0;
var baloons_cnt=10;
var arrows_cnt=20;
var arrows_bonus=0;
var arrow_send_time=0;
var bursted_baloons=0;
var passed_baloons=0;
var sec_check=0;
var game_ended=false;
var hand_play=false
var brick_chance=0;

g_process=function(){};



var path=[[[-10,160],[42.3,146],[195.3,158.7],[193,208]],[[193,208],[190.7,257.3],[30.3,299.7],[30,470]],[[30,470],[29.7,640.3],[159,706.7],[224,705]],[[224,705],[289,703.3],[421.3,610.5],[420,460]],[[420,460],[418.7,309.5],[258.7,263],[258,210]],[[258,210],[257.3,157],[396.3,153.7],[470,160]]];

var l_info=[[10,20,3,0],[12,20,3,0.02],[14,20,3,0.04],[16,20,3,0.06],[18,20,3,0.08],[20,20,3,0.1],[22,20,3,0.12],[24,20,3,0.14],[26,20,3,0.16],[28,20,3,0.18],[30,20,3,0.2],[32,20,3,0.22],[34,20,3,0.24],[36,20,3,0.26],[38,20,3,0.28],[40,20,3,0.3],[42,20,3,0.32],[44,20,3,0.34],[46,20,3,0.36],[48,20,3,0.38],[50,20,3,0.4],[52,20,3,0.42],[54,20,3,0.44],[56,20,3,0.46],[58,20,3,0.48]];





//это бонусы стрел после уровня
arrows_as_bonus=0;

//сосотяния шара
b_simple=0;
b_bonus_arrows=1;
b_bonus_slow=2;
b_brick=3;
b_bonus_hand=4;
b_bonus_hand2=5;




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
	
	add_anim_scale(spr,anim,scl_x0, scl_x1, scl_y0, scl_y1,spd,hide_on_end=false)
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
				var dx=scl_x1-scl_x0;
				var dy=scl_y1-scl_y0;
				this.anim_array[i]=[a_scale,spr,func,0,scl_x0,scl_y0,dx,dy,spd,hide_on_end]
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
					if (this.anim_array[i][3]<1)
					{	
						this.anim_array[i][1].scale.x=this.anim_array[i][4]+this.anim_array[i][6]*this.anim_array[i][2](this.anim_array[i][3]);
						this.anim_array[i][1].scale.y=this.anim_array[i][5]+this.anim_array[i][7]*this.anim_array[i][2](this.anim_array[i][3]);
						this.anim_array[i][3]+=this.anim_array[i][8];		
					}
					else
					{
						if (this.anim_array[i][9]==true)
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
		this.cur_segm=0;
		this.t=0;
		this.p0=0;
		this.p1=0;
		this.p2=0;
		this.p3=0;
		
		this.prv_d=0;
		this.spd=0;
		this.type=b_simple;
		this.is_slow_down=false;
		this.slow_down_start=0;
		
		this.sec_check=0;
		
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
			
		

		this.cur_segm=-1;
		this.t=0;
		this.p0=0;
		this.p1=0;
		this.p2=0;
		this.p3=0;
		
		this.visible=true;

		this.spd=0.004;
		this.is_slow_down=false;
		this.slow_down_start=0;
		
		this.sec_check=game_tick;
		this.send_time=game_tick;
		this.bonus_time=0;
		this.visible=true;
		
		//this.total_path_len=this.total_path();

		this.retarget();	
	}
	
	slow_down()
	{
		
		this.spd=0.001;
		this.is_slow_down=true;
		this.slow_down_start=game_tick;
		
	}
	
	retarget()
	{
		this.cur_segm++;		
		if (this.cur_segm===path.length)
		{
			decrease_life();
			this.visible=false;			
			return;
		}

		this.t=0;
		this.p0=path[this.cur_segm][0];
		this.p1=path[this.cur_segm][1];
		this.p2=path[this.cur_segm][2];
		this.p3=path[this.cur_segm][3];


	}
	
	turn_to_simple()
	{
		
		this.type=b_simple;
		this.texture=game_res.resources['baloon'].texture;	
	}
		
	turn_to_bonus()
	{	
		
		var r_int=Math.floor(Math.random() * 4);
		
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
			
			case 3:
			this.type=b_bonus_hand2;
			this.texture=game_res.resources['baloon_bonus_hand2'].texture;	
			break;
			
		}


		this.bonus_time=game_tick;
		
	}
	
	process()
	{				
		if (this.visible===false)
			return;
		
		
		//секундная проверка и превращение в бонусы
		if (game_tick>this.sec_check+60)
		{			
			if (this.type===b_simple)
			{
				if (Math.random()>0.95)
				{					
					this.turn_to_bonus();
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
				this.spd=0.004;				
			}		
		}
		
		//превращаем бонусные шары в обычные
		if (this.type==b_bonus_arrows || this.type==b_bonus_slow || this.type==b_bonus_hand || this.type==b_bonus_hand2)
		{
			if (game_tick>this.bonus_time+240)
			{
				this.texture=game_res.resources['baloon'].texture;
				this.type=b_simple;
			}			
		}
		
		var nx=Math.pow(1-this.t,3)*this.p0[0]+3*Math.pow(1-this.t,2)*this.t*this.p1[0]+3*(1-this.t)*this.t*this.t*this.p2[0]+Math.pow(this.t,3)*this.p3[0];
		var ny=Math.pow(1-this.t,3)*this.p0[1]+3*Math.pow(1-this.t,2)*this.t*this.p1[1]+3*(1-this.t)*this.t*this.t*this.p2[1]+Math.pow(this.t,3)*this.p3[1];
		
		var dx=nx-this.x;
		var dy=ny-this.y;
		var d=dx*dx+dy*dy;
		d=Math.sqrt(d);
		
		
		this.x=nx;
		this.y=ny;
		
		this.t+=this.spd*g_spd;
		if (this.t>=1)
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
		if (objects.baloons[i].visible===false)
		{

			objects.baloons[i].send(brick_chance);						
			prv_baloon_send=game_tick;	
			baloons_sent++;				

			return;
		}			
	}
}

function add_arrows(cnt)
{
	arrows_cnt+=cnt;
	objects.arrows_info_text.text="X"+arrows_cnt
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
	


	//обновляем инфор о количестве стрел
	arrows_cnt--;	
	objects.arrows_info_text.text="x"+arrows_cnt
	

}
		
function send_many_arrows(px,py)
{
	
	var cnt=4;
	var inc_a=PI_2/cnt;
	var inc_i=0;
	
	
	//ищем свободную стрелу для запуска
	for (var i=0;i<objects.arrows.length;i++)
	{
		if (objects.arrows[i].visible==false)
		{				
			objects.arrows[i].send(px,py,inc_a*inc_i+PI/4);
			inc_i++;
			
			if (inc_i===cnt)
				return;
		}
	}		

}
	
function send_many_arrows2(px,py)
{
	
	var cnt=5;
	var inc_a=PI_2/cnt;
	var inc_i=0;
	
	
	//ищем свободную стрелу для запуска
	for (var i=0;i<objects.arrows.length;i++)
	{
		if (objects.arrows[i].visible==false)
		{				
			objects.arrows[i].send(px,py,inc_a*inc_i-0.314159);
			inc_i++;
			
			if (inc_i===cnt)
				return;
		}
	}		

}
		
function decrease_life()
{
	life--;
	if (life<0)
		life=0;
	objects.life_info.text="x"+this.life;
	passed_baloons++;
}
		
//подсчитываем активные стрелы
function count_active_arrows()
{	
	var cnt=0;
	for (var k=0;k<objects.arrows.length;k++)
		if (objects.arrows[k].visible===true)
			cnt++;

	return cnt;	
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


	//это нажатие кнопки
	function button_down()
	{
		//отключаем кнопку чтобы ее не нажимали много раз
		objects.button_1.interactive=false;		
		
		g_process=process_2;
		on_start=true;
	}
	process_1.button_down=button_down;
	
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
		
		
		objects.level_note.text="Level "+(level+1);
		objects.arrows_info_text.text="x"+arrows;
		objects.life_info.text="x"+life;
	
		//сначала выключаем все шары которые возможно остались от предыдущих игр
		objects.baloons.forEach(e=>e.visible=false);	
		baloons_sent=0;
		bursted_baloons=0;
		prv_baloon_send=0;
		baloons_cnt=l_info[level][0];		
		life=l_info[level][2];
		
		//устанавливаем вероятность кирпичного шара
		brick_chance=l_info[level][3];
		
		//восстанавливаем количество стрел
		arrows_cnt=l_info[level][1]+arrows_bonus;
		objects.arrows_info_text.text="x"+arrows_cnt;
		life=10;
	
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
		c.add_anim_scale(objects.level_note,			a_in,	0,	1,	1,  1,	0.01);	
		
		c.add_anim_in_pos(objects.arrow,		a_in,	dx=-400,		dy=0,	0.02);	
		c.add_anim_in_pos(objects.bow,			a_in,	dx=400,			dy=0,	0.02);	
		c.add_anim_in_pos(objects.pause_button,		a_in,	dx=100,			dy=0,	0.02);	
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
		
		objects.life_info.text="x"+life;
		sec_check=0;
		passed_baloons=0;
		bursted_baloons=0;
		
		//устанавливаем текстуру лука
		objects.bow.texture=game_res.resources['bow'].texture;

		//включаем кнопку паузы
		objects.pause_button.interactive=true;
	
		//активируем нажатие на лук
		objects.bcg5.pointerdown=function(){send_arrow();};
	
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
	for (var k=0;k<objects.arrows.length;k++)
	{
		if(objects.arrows[k].visible==true)
		{	
	
			for(var i=0;i<objects.baloons.length;i++)
			{
				if(objects.baloons[i].visible==true)
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
								objects.baloons[i].turn_to_bonus();
								objects.arrows[k].visible=false;							
							break;
							
							case b_simple:
								objects.baloons[i].visible=false;	
								bursted_baloons++;									
							break;
							
							case b_bonus_arrows:
								objects.baloons[i].visible=false;	
								add_arrows(3);		
								bursted_baloons++;							
							break;
							
							case b_bonus_slow:
								objects.baloons[i].visible=false;	
								objects.baloons.forEach(e=>e.slow_down());
								bursted_baloons++;								
							break;
							
							case b_bonus_hand:
								objects.baloons[i].visible=false;	
								objects.arrows[k].visible=false;	
								send_many_arrows(objects.baloons[i].x,objects.baloons[i].y);
								bursted_baloons++;								
							break;
							
							case b_bonus_hand2:
								objects.baloons[i].visible=false;	
								objects.arrows[k].visible=false;	
								send_many_arrows2(objects.baloons[i].x,objects.baloons[i].y);
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
		
		
		var a_cnt=count_active_arrows();		
		if (arrows_cnt===0 && a_cnt===0 && game_ended==false)
		{
			g_process=process_4;
			on_start=true;
			return;
		}
		
		sec_check=game_tick;
	}


	//это нажатие паузы
	function button_down()
	{
		
		//отключаем кнопку чтобы много раз не нажимали
		objects.pause_button.interactive=false;
		
		//включаем кнопку продолжения
		objects.resume_button.interactive=true;
		
		g_process=process_7;
		on_start=true;
		
		return;
	}
	process_3.button_down=button_down;
	

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


		//отключаем замедление
		objects.baloons.forEach(e=>e.spd=0.004);
	
		//отключаем паузу и убираем ее
		objects.pause_button.interactive=false;	
		
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
		
	//тик
	game_tick++;
	
	//анимация
	c.process();
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
		
		
		//добавляем количество звезд в зависимости от результата
		if (life>0)
			c.add_anim_in_pos(objects.star1,			a_in_bounce,0,	-500	,0.02,true);
	
		if (life>3)
			c.add_anim_in_pos(objects.star2,			a_in_bounce,0,	-500	,0.015,true);
		
		if (life>6)
			c.add_anim_in_pos(objects.star3,			a_in_bounce,0,	-500	,0.01,true);
	
		//увеличиваем уровень
		level++;
		
		//отключаем паузу и убираем ее
		objects.pause_button.interactive=false;
		c.add_anim_out_pos(objects.pause_button, a_out,objects.pause_button.x+200,		objects.pause_button.y	,0.04,true);	
	
		//другие инициализации
		on_start=false;
		game_tick=0;
	}
	
	
	
	//показываем бонусы 
	if (game_tick===100)
	{
		
		
		
		//добавляем количество звезд в зависимости от результата
		if (life>0 && life<4)
			arrows_bonus=1;
	
		if (life>3 && life<7)
			arrows_bonus=5;
		
		if (life>6)
			arrows_bonus=10;
		
		
		objects.bonus.texture=game_res.resources["bonus_"+arrows_bonus].texture;		
		c.add_anim_in_pos(objects.bonus,	a_in_bounce,0,	-500	,0.02,true);	
		
		
	
	}
	
	
	//показываем кнопку 
	if (game_tick===100)
	{
		//Включаем  кнопку
		objects.next_level_button.interactive=true;
		
		c.add_anim_scale(objects.next_level_button, a_in,0,1,1,1,0.02);			
	}
	

	
	
	//это нажатие кнопки
	function button_down()
	{
		g_process=process_2;
		on_start=true;
		
		//убираем кнопку с анимацией,звезды и другие объекты
		c.add_anim_scale(objects.next_level_button, a_out,1,1,1,0,0.02,true);
		c.add_anim_out_pos(objects.win,				a_out,objects.win.x+500,	objects.win.y	,0.02,true);	
		
		
		//убираем звезды если они есть
		if (objects.star1.visible===true)
			c.add_anim_out_pos(objects.star1,	a_out,objects.star1.x,	objects.star1.y+600	,0.01,true);
	
		if (objects.star2.visible===true)
			c.add_anim_out_pos(objects.star2,	a_out,objects.star2.x,	objects.star2.y+600	,0.015,true);
	
		if (objects.star3.visible===true)
			c.add_anim_out_pos(objects.star3,	a_out,objects.star3.x,	objects.star3.y+600	,0.02,true);		
		
		if (objects.bonus.visible===true)
			c.add_anim_out_pos(objects.bonus,	a_out,objects.bonus.x-500,	objects.bonus.y	,0.02,true);	
		
		
		//отключаем кнопку
		objects.next_level_button.interactive=false;
		
		
		g_process=process_2;
		on_start=true;
	}
	process_6.button_down=button_down;
	
	
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
	
		//отключаем паузу и убираем ее
		objects.pause_button.interactive=false;	
		c.add_anim_out_pos(objects.pause_button, a_out,objects.pause_button.x+200,		objects.pause_button.y	,0.04,true);		
	
		//другие инициализации
		on_start=false;
		
		//нет бонуса стрел
		arrows_bonus=0;
		
		//сбрасываем счетчик
		game_tick=0;
	}
	
	
	//показываем кнопку retry  и включаем ее
	if (game_tick===70)
	{
		c.add_anim_scale(objects.retry_button, a_in,0,1,1,1,0.02);			
		objects.retry_button.interactive=true;
	}

	
	
	//обрабатываем стрелки
	objects.arrows.forEach(e=>e.process());	
	
	//обрабатываем шары
	objects.baloons.forEach(e=>e.process());
	
	
	//это нажатие кнопки
	function button_down()
	{
		g_process=process_2;
		on_start=true;
		
		//убираем кнопку с анимацией и отключаем ее
		c.add_anim_scale(objects.retry_button, a_out,1,1,1,0,0.02,true);
		objects.retry_button.interactive=false;
		
		g_process=process_2;
		on_start=true;
	}
	process_6.button_down=button_down;
	
	
	//тик
	game_tick++;
	
	//анимация
	c.process();
	
}

//это эпизод паузы
function process_7()
{	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{		
		
		//убираем ненужные объекты
		c.add_anim_out_pos(objects.pause_button, a_out,objects.pause_button.x+200,		objects.pause_button.y	,0.04,true);		

	
		//добавляем новые объекты
		c.add_anim_in_pos(objects.pause_block,		a_in,-500,	0	,0.04,true);
		c.add_anim_in_pos(objects.resume_button,	a_in,-500,	0	,0.04,true);
	
		//другие инициализации
		on_start=false;
		
		//сбрасываем счетчик
		game_tick=0;
	}
	
	

	
		
	//это нажатие кнопки
	function button_down()
	{
		
		//убираем  объекты
		c.add_anim_out_pos(objects.pause_block, a_out,objects.pause_block.x+400,		objects.pause_block.y	,0.04,true);	
		c.add_anim_out_pos(objects.resume_button, a_out,objects.resume_button.x+400,		objects.resume_button.y	,0.04,true);
		
		//добавляем объекты
		c.add_anim_in_pos(objects.pause_button,		a_in,	dx=100,			dy=0,	0.04);	
		
		//снова включаем кнопку
		objects.pause_button.interactive=true;
		
		//отключаем кнопку продолжения
		objects.resume_button.interactive=false;
		
		g_process=process_3;
		//on_start=true;
	}
	process_7.button_down=button_down;
	
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


