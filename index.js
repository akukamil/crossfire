var PI=3.1415926535,PI_2=6.283185307, M_WIDTH=450, M_HEIGHT=800, game_tick;
var app, game_res=new PIXI.Loader(), game_tick=0, g_spd=5, objects={}, baloons=[], a_cnt=20
var screen_0, screen_1, screen_2, screen_3;
var my_data={};

var is_normal_game=false;
var level=0;
var arrows=20;
var life=0;
var last_baloon_send_time=0;
var baloons_sent=0;
var baloons_cnt=10;
var arrows_cnt=20;
var arrows_bonus=0;
var arrow_send_time=0;
var bursted_baloons=0;
var baloons_finished=0;
var sec_check=0;
var game_ended=false;
var hand_play=false
var brick_chance=0;
var fast_init_time=0;

g_process=function(){};



var path=[[[-34,171],[38.3,138],[182.3,162.3],[193,213]],[[193,213],[203.7,263.6],[30.3,304.6],[30,475]],[[30,475],[29.7,645.3],[159,711.6],[224,710]],[[224,710],[289,708.3],[421.3,615.5],[420,465]],[[420,465],[418.7,314.5],[258.7,268],[258,215]],[[258,215],[257.3,162],[396.3,158.6],[470,165]]];

var l_info=[[10,20,3,0,100],[12,20,3,0.02,105],[14,20,3,0.04,110],[16,20,3,0.06,115],[18,20,3,0.08,120],[20,20,3,0.1,125],[22,20,3,0.12,130],[24,20,3,0.14,135],[26,20,3,0.16,140],[28,20,3,0.18,145],[30,20,3,0.2,150],[32,20,3,0.22,155],[34,20,3,0.24,160],[36,20,3,0.26,165],[38,20,3,0.28,170],[40,20,3,0.3,175],[42,20,3,0.32,180],[44,20,3,0.34,185],[46,20,3,0.36,190],[48,20,3,0.38,195],[50,20,3,0.4,200],[52,20,3,0.42,205],[54,20,3,0.44,210],[56,20,3,0.46,215],[58,20,3,0.48,220],[60,20,3,0.5,225],[62,20,3,0.52,230],[64,20,3,0.54,235]];



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

var anim={
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	
	anim_array: [null,null,null,null,null,null,null,null,null,null,null],	
	linear: function(x) {
		
		return x
	},
	linear_and_back: function(x) {
		
		return x < 0.2 ? x*5 : 1.25 - x * 1.25

	},
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},	
	easeOutBounce: function(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	easeOutQuart: function(x) {
		return 1 - Math.pow(1 - x, 4);
	},
	easeOutQuint: function(x) {
		return 1 - Math.pow(1 - x, 5);
	},
	easeInCubic: function(x) {
		return x * x * x;
	},
	easeInQuint: function(x) {
		return x * x * x * x * x;
	},
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	add_pos: function(params){

		if (params.callback===undefined)
			params.callback=()=>{};
		
		//ищем свободный слот для анимации
		for (var i=0;i<this.anim_array.length;i++)	{
			
			if (this.anim_array[i]===null)	{
			
				params.obj.visible=true;
				params.obj.alpha=1;
				params.obj.ready=false;				
				
				//если в параметрах обозначена строка  - предполагаем что это параметр объекта
				if (typeof(params.val[0])==='string') params.val[0]=params.obj[params.val[0]];
				if (typeof(params.val[1])==='string') params.val[1]=params.obj[params.val[1]];				
				
				params.obj[params.param]=params.val[0];
				var delta=params.val[1]-params.val[0];	
				this.anim_array[i]={
										obj:params.obj, 
										process_func: this.process_pos.bind(this), 
										param:params.param, 
										vis_on_end:params.vis_on_end, 
										delta, 
										func:this[params.func].bind(anim), 
										start_val:params.val[0], 
										speed:params.speed ,
										progress:0, 
										callback:params.callback
									};	
				return;
			}
			
		}
		
		console.log("Нет свободных слотов для анимации");
		
	},
	add_scl: function(params){
	
		if (params.callback===undefined)
			params.callback=()=>{};
		
		//ищем свободный слот для анимации
		for (var i=0;i<this.anim_array.length;i++)	{
			
			if (this.anim_array[i]===null)	{
			
				params.obj.visible=true;
				params.obj.alpha=1;
				params.obj.ready=false;				
				
				var delta=params.val[1]-params.val[0];	
				this.anim_array[i]={
									obj:			params.obj, 
									process_func: 	this.process_scl.bind(this), 
									param:			params.param, 
									vis_on_end:		params.vis_on_end, 
									delta, 
									func:			this[params.func].bind(anim), 
									start_val:		params.val[0], 
									speed:			params.speed ,
									progress:		0, 
									callback		:params.callback
								};	
				return;
			}
			
		}
		
		console.log("Нет свободных слотов для анимации");
		
	},
	process: function()	{
		for (var i=0;i<this.anim_array.length;i++)
			if (this.anim_array[i]!==null)
				this.anim_array[i].process_func(i);
	},
	process_pos: function(i) {
		
		this.anim_array[i].obj[this.anim_array[i].param]=this.anim_array[i].start_val+this.anim_array[i].delta*this.anim_array[i].func(this.anim_array[i].progress);
						
		if (this.anim_array[i].progress>=1)	{
			this.anim_array[i].callback();
			this.anim_array[i].obj.visible=this.anim_array[i].vis_on_end;
			this.anim_array[i].obj.ready=true;
			this.anim_array[i]=null;	
			return;			
		}
		
		this.anim_array[i].progress+=this.anim_array[i].speed;
	},
	process_scl: function(i) {
		
		this.anim_array[i].obj.scale[this.anim_array[i].param]=this.anim_array[i].start_val+this.anim_array[i].delta*this.anim_array[i].func(this.anim_array[i].progress);
						
		if (this.anim_array[i].progress>=1)	{
			this.anim_array[i].callback();
			this.anim_array[i].obj.visible=this.anim_array[i].vis_on_end;
			this.anim_array[i].obj.ready=true;
			this.anim_array[i]=null;
			return;
		}
		
		this.anim_array[i].progress+=this.anim_array[i].speed;
	}
	
}


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
		
		this.spd=0.004;
		this.is_slow_down=false;
		this.slow_down_start=0;
		
		this.sec_check=game_tick;
		this.send_time=game_tick;
		this.bonus_time=0;
		this.visible=true;
		

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
			last_baloon_send_time=game_tick;	
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
	if (objects.bow.ready===false || objects.bow.visible===false || objects.pause_block.visible===true)
		return;		
	
	
	if (arrows_cnt===0)
		return;
	
	//запоминаем время выстрела
	arrow_send_time=game_tick;
	
	//ищем свободную стрелу для запуска
	for (var i=0;i<objects.arrows.length;i++)
	{
		if (objects.arrows[i].visible==false)
		{				
	
			//играем звуки
			game_res.resources.arrow_send.sound.play();
		
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
	
	//играем звук
	if (g_spd===1)
		game_res.resources.warning.sound.play();
	
	
	objects.life_info.text="x"+this.life;
	baloons_finished++;
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
		
		game_res.resources.music.sound.play();
			
		
		anim.add_pos({obj:objects.game_name,param:'y',vis_on_end:true,func:'easeOutBack',val:[-150, 	'sy'],	speed:0.02});
		anim.add_pos({obj:objects.baloon5,	param:'x',vis_on_end:true,func:'easeOutBack',val:[-140, 	'sx'],	speed:0.025});
		anim.add_pos({obj:objects.bow5,		param:'x',vis_on_end:true,func:'easeOutBack',val:[450, 	'sx'],		speed:0.02});
		anim.add_pos({obj:objects.button_1,	param:'y',vis_on_end:true,func:'easeOutBack',val:[800, 	'sy'],		speed:0.025});
		
		/*
		objects.message_box_cont.visible=true;
		
		if (my_data.uid==='error')
		{			
			//objects.message_text.text="авторизация в яндексе не выполнена";
			console.log("авторизация в яндексе не выполнена");
		}		
		else
		{
			if (my_data.first_name==='')
				console.log("нет личных данных")
			
			switch (my_data['db']) {
				
				case 'ok': 
					console.log("старый пользователь")
				break;
				
				case 'new': 
					console.log("новый пользователь")
				break;
				
				case 'error': 
					console.log("ошибка базы данных")
				break;
				
			}			
			
		}*/

		
		
		
		//другие инициализации
		game_tick=0;
		on_start=false;
	}
			
	//это нажатие кнопки
	function start_button_down()
	{
		
		if (objects.button_1.ready===false)
			return;			
				
		//звук
		game_res.resources.music.sound.volume=0.5;
		game_res.resources.click.sound.play();
		
		g_process=process_2;
		on_start=true;
	}
	process_1.button_down=start_button_down;
	
	objects.game_name.rotation=Math.sin(game_tick/10)/10;
	objects.baloon5.rotation=Math.sin(game_tick/100);
	objects.bow5.rotation=Math.sin(game_tick/140);
	
	//крутим кнопку пока не загрузились данные
	if (objects.button_1.interactive===false)
		objects.button_1.rotation+=0.1;
	
	//тик
	game_tick++;
	
	//анимация
	anim.process();
	
}

//быстрая загрузка уровня
function process_2()
{
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		
		//убираем ненужные объекты		
		if (objects.game_name.visible===true)
			anim.add_pos({obj:objects.game_name,	param:'x',vis_on_end:false,func:'linear', val:['sx',	-450],	speed:0.02});	
		if (objects.baloon5.visible===true)
			anim.add_pos({obj:objects.baloon5,		param:'x',vis_on_end:false,func:'linear', val:['sx',	450],	speed:0.02});	
		if (objects.bow5.visible===true)
			anim.add_pos({obj:objects.bow5,			param:'x',vis_on_end:false,func:'linear', val:['sx',	-450],	speed:0.02});	
		if (objects.button_1.visible===true)
			anim.add_pos({obj:objects.button_1,		param:'x',vis_on_end:false,func:'linear', val:['sx',	450],	speed:0.02});
				
		
		objects.level_note.text="Уровень "+(level+1);

	
		//сначала выключаем все шары которые возможно остались от предыдущих игр
		objects.baloons.forEach(e=>e.visible=false);	
		baloons_sent=0;
		bursted_baloons=0;
		last_baloon_send_time=0;
		baloons_cnt=l_info[level][0];		


		//время быстрого запуска
		fast_init_time=l_info[level][4];	
		
		//устанавливаем вероятность кирпичного шара
		brick_chance=l_info[level][3];
		
		//восстанавливаем количество стрел
		arrows_cnt=l_info[level][1]+arrows_bonus;
		objects.arrows_info_text.text="x"+arrows_cnt;
		
		//устанавливаем количество жизней
		life=10;
		objects.life_info.text="x"+life;	
		
		//другие инициализации		
		g_spd=5;
		game_tick=0;
		on_start=false;
	}

	//после того как все завершилось
	if (game_tick===60)
	{
		//включаем нужные объекты		
		if (objects.game_ui_cont.visible===false)
			anim.add_pos({obj:objects.game_ui_cont,	param:'y',vis_on_end:true,func:'linear',val:[-210, 	'sy'],	speed:0.02});
		anim.add_pos({obj:objects.arrow,		param:'x',vis_on_end:true,func:'linear',val:[-50, 	'sx'],	speed:0.02});
		anim.add_pos({obj:objects.bow,			param:'x',vis_on_end:true,func:'linear',val:[450, 	'sx'],	speed:0.02});
		anim.add_pos({obj:objects.pause_button,	param:'y',vis_on_end:true,func:'linear',val:[800, 	'sy'],	speed:0.05});
		
	}
	
	//крутим лук и стрелу
	objects.bow.rotation+=0.05*g_spd;
	objects.arrow.rotation+=0.05*g_spd;		


	//добавляем шары
	if (baloons_sent<baloons_cnt)
	{
		if(game_tick>last_baloon_send_time+60/g_spd)
		{
			send_baloon();		
		}			
	}

	//обрабатываем шары
	objects.baloons.forEach(e=>e.process());


	//завершаем через некоторое время
	if(game_tick===fast_init_time)
	{
		
		
		g_process=process_3;
		on_start=true;
	}

	//тик
	game_tick++;
	
	//анимация
	anim.process();
	
}

//это нормальная игра
function process_3()
{
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		
		game_res.resources.music.sound.volume=0.25;
		
		
		g_spd=1;
		game_ended=false;
		
		objects.life_info.text="x"+life;
		sec_check=0;
		baloons_finished=0;
		bursted_baloons=0;
		
		//устанавливаем текстуру лука
		objects.bow.texture=game_res.resources['bow'].texture;
	
		//активируем нажатие на лук
		objects.bcg5.pointerdown=function(){send_arrow();};
	
		//другие инициализации
		on_start=false;
		
		
		//подсказка игры
		if (level===0)
		{
			anim.add_pos({obj:objects.hand_click,	param:'x',vis_on_end:true,func:'linear',val:[450, 'sx'],	speed:0.02});
			objects.hand_click.play();			
		}

	}

	//убираем подсказку игры
	if (level===0)
		if (game_tick===fast_init_time+100)
			anim.add_pos({obj:objects.hand_click,	param:'x',vis_on_end:false,func:'linear',val:['sx', 450],	speed:0.02});	
		
	
	//крутим лук и стрелу
	objects.bow.rotation+=0.05*g_spd;
	objects.arrow.rotation+=0.05*g_spd;		

	//добавляем шары
	if (baloons_sent<baloons_cnt)
		if(game_tick>last_baloon_send_time+60/g_spd)
			send_baloon();	


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
								game_res.resources.brick.sound.play();								
							break;
							
							case b_simple:
								objects.baloons[i].visible=false;	
								game_res.resources.baloon_burst.sound.play();
								bursted_baloons++;									
							break;
							
							case b_bonus_arrows:
								objects.baloons[i].visible=false;	
								add_arrows(3);		
								game_res.resources.arrows_bonus.sound.play();
								bursted_baloons++;							
							break;
							
							case b_bonus_slow:
								objects.baloons[i].visible=false;	
								objects.baloons.forEach(e=>e.slow_down());
								game_res.resources.freeze_bonus.sound.play();
								bursted_baloons++;								
							break;
							
							case b_bonus_hand:
								objects.baloons[i].visible=false;	
								objects.arrows[k].visible=false;	
								send_many_arrows(objects.baloons[i].x,objects.baloons[i].y);
								game_res.resources.multi.sound.play();
								bursted_baloons++;								
							break;
							
							case b_bonus_hand2:
								objects.baloons[i].visible=false;	
								objects.arrows[k].visible=false;	
								send_many_arrows2(objects.baloons[i].x,objects.baloons[i].y);
								game_res.resources.multi.sound.play();
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
		
		//if (bursted_baloons>0 && game_ended==false)
		if (life==0 && game_ended==false)
		{
			game_ended=true;				
			g_process=process_6;
			on_start=true;
			return;
		}
		
		//
		//if (bursted_baloons>0 && game_ended==false)
		if ((bursted_baloons+baloons_finished)==baloons_cnt && game_ended==false)
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
	function pause_down()
	{
		if (objects.pause_button.ready===false)
			return;		
		
		g_process=process_7;
		on_start=true;		
		return;
	}
	process_3.button_down=pause_down;
	

	//тик
	game_tick++;
	
	//анимация
	anim.process();
	
}

//это эпизод с отуствием стрел
function process_4()
{	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		
		game_res.resources.speedup.sound.play();
		g_spd=5;


		//отключаем замедление
		objects.baloons.forEach(e=>e.spd=0.004);
		
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
	
	//добавляем шары
	if (baloons_sent<baloons_cnt)
	{
		if(game_tick>last_baloon_send_time+60/g_spd)
		{
			send_baloon();		
		}			
	}
	
	
	//обрабатываем событие выигрыша или проигрыша
	if (life==0 && game_ended==false)
	{
		game_ended=true;				
		g_process=process_6;
		on_start=true;
		return;
	}
	
	if ((bursted_baloons+baloons_finished)==baloons_cnt && game_ended==false)
	{			
		game_ended=true;				
		g_process=process_5;
		on_start=true;
		return;
	}
		

		
	//тик
	game_tick++;
	
	//анимация
	anim.process();
}

//это эпизод выигрыша
function process_5()
{	

	//если это последний уровень то переходим к заключитьельному эпизоду
	if (level===26)
	{
		g_process=process_8;
		on_start=true;
		return;
	}

	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{
		//играем звуки
		game_res.resources.win_level.sound.play();
			
		//убираем ненужные объекты		
		anim.add_pos({obj:objects.arrow,	param:'x',vis_on_end:false,func:'linear', val:['sx',	450],		speed:0.02});
		anim.add_pos({obj:objects.bow,		param:'x',vis_on_end:false,func:'linear', val:['sx',	450],		speed:0.02});
		
	
		//добавляем основное окно
		anim.add_pos({obj:objects.win,		param:'x',vis_on_end:true,func:'easeOutElastic',val:[-500, 		'sx'],	speed:0.01});
				
		if (my_data.uid!=="")
			firebase.database().ref("players/"+my_data.uid+"/level").set(level+1);	
		
		//отключаем паузу и убираем ее
		anim.add_pos({obj:objects.pause_button,	param:'y',vis_on_end:false,func:'linear', val:['sy',	800],	speed:0.02});

	
		//другие инициализации
		on_start=false;
		game_tick=0;
	}
	
	
	//показываем звезды 
	if (game_tick===30)
	{
		//добавляем количество звезд в зависимости от результата
		if (life>0)
			anim.add_pos({obj:objects.star1,		param:'y',vis_on_end:true,func:'easeOutBounce',val:[-100, 		'sy'],	speed:0.01});	
		if (life>3)
			anim.add_pos({obj:objects.star2,		param:'y',vis_on_end:true,func:'easeOutBounce',val:[-100, 		'sy'],	speed:0.015});		
		if (life>6)
			anim.add_pos({obj:objects.star3,		param:'y',vis_on_end:true,func:'easeOutBounce',val:[-100, 		'sy'],	speed:0.02});	
	}
	
		
	//показываем бонусы 
	if (game_tick===90)
	{
		
		

		
		//добавляем количество звезд в зависимости от результата
		if (life>0 && life<4)
			arrows_bonus=1;
	
		if (life>3 && life<7)
			arrows_bonus=5;
		
		if (life>6)
			arrows_bonus=10;
		
		
		objects.bonus.texture=game_res.resources["bonus_"+arrows_bonus].texture;		
		anim.add_pos({obj:objects.bonus,	param:'y',vis_on_end:true,func:'easeOutElastic', val:[-50,	'sy'],	speed:0.015});
		
	
	}
	
	
	//показываем кнопки 
	if (game_tick===100)
	{	
		anim.add_scl({obj:objects.next_level_button,		param:'y',vis_on_end:true,func:'linear', val:[0,1],	speed:0.025});
		anim.add_scl({obj:objects.replay_level_button,	param:'y',vis_on_end:true,func:'linear', val:[0,1],	speed:0.025});	
	}
	
	
	//это нажатие кнопки следующего уровня
	function next_button_down(lev_inc)
	{
		//показываем рекламу
		if (window.ysdk===undefined)
		{
			go_next_lev(lev_inc)
		}
		else
		{
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: (function(wasShown) {go_next_lev(lev_inc)}).bind(process_5), 
				onError: (function(error) 	 {go_next_lev(lev_inc)}).bind(process_5)
						}
			})			
		}
	}
	
	function go_next_lev(lev_inc) {
		
		if (objects.next_level_button.ready===false)
			return;
		
		
		//звук
		game_res.resources.click.sound.play();
		
		//увеличиваем уровень
		level+=lev_inc;
		
		g_process=process_2;
		on_start=true;
		
		//убираем кнопку с анимацией,звезды и другие объекты		
		anim.add_scl(	{obj:objects.next_level_button,		param:'y',vis_on_end:false,func:'linear', val:[1,	0],	speed:0.02});
		anim.add_scl(	{obj:objects.replay_level_button,	param:'y',vis_on_end:false,func:'linear', val:[1,	0],	speed:0.02});
		anim.add_pos(	{obj:objects.win,					param:'x',vis_on_end:false,func:'linear', val:['sx',	-510],	speed:0.02});
		
		
		//убираем звезды если они есть
		if (objects.star1.visible===true)
			anim.add_pos({obj:objects.star1,	param:'y',vis_on_end:false,func:'easeInBack', val:['sy',	900],	speed:0.01});
	
		if (objects.star2.visible===true)
			anim.add_pos({obj:objects.star2,	param:'y',vis_on_end:false,func:'easeInBack', val:['sy',	900],	speed:0.015});	
	
		if (objects.star3.visible===true)
			anim.add_pos({obj:objects.star3,	param:'y',vis_on_end:false,func:'easeInBack', val:['sy',	900],	speed:0.02});	
		
		if (objects.bonus.visible===true)
			anim.add_pos({obj:objects.bonus,	param:'alpha',vis_on_end:false,func:'linear', val:[1,	0],	speed:0.02});	
		
		
			
		g_process=process_2;
		on_start=true;
		
	}
	
	process_6.button_down=next_button_down;
	
	
	//обрабатываем стрелки
	objects.arrows.forEach(e=>e.process());	
	
	//тик
	game_tick++;
	
	//анимация
	anim.process();
	
}

//это эпизод проигрыша
function process_6()
{	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{		
		//проигрываем звук
		game_res.resources.lose.sound.play();
		
		//убираем ненужные объекты
		anim.add_pos({obj:objects.arrow,	param:'x',vis_on_end:false,func:'linear', val:['sx',	450],	speed:0.02});
		anim.add_pos({obj:objects.bow,		param:'x',vis_on_end:false,func:'linear', val:['sx',	450],		speed:0.02});
	
		//добавляем новые объекты
		anim.add_pos({obj:objects.game_over,		param:'y',vis_on_end:true,func:'linear',val:[-500, 		'sy'],	speed:0.02});

	
		//убираем паузу
		anim.add_pos({obj:objects.pause_button,	param:'y',vis_on_end:false,func:'linear', val:['sy',	800],	speed:0.02});	
	
		//другие инициализации
		on_start=false;
		
		//нет бонуса стрел
		arrows_bonus=0;
		
		//сбрасываем счетчик
		game_tick=0;
	}
	
	
	//показываем кнопки
	if (game_tick===70) {
		anim.add_scl({obj:objects.retry_button,		param:'x',vis_on_end:true,func:'linear', val:[0,1],	speed:0.02});		
		anim.add_scl({obj:objects.ad_for_arrows_button,		param:'x',vis_on_end:true,func:'linear', val:[0,1],	speed:0.02});
	}

	
	//обрабатываем стрелки
	objects.arrows.forEach(e=>e.process());	
	
	//обрабатываем шары
	objects.baloons.forEach(e=>e.process());
	
	
	//это нажатие кнопки
	function button_down()
	{		
	
	
		if (window.ysdk===undefined)
		{			
			restart();
		}
		else
		{
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: (function(wasShown) {restart()}).bind(process_6), 
				onError: (function(error) {restart()}).bind(process_6)
						}
			})
		}

		
		
	}
	
	function ad_for_arrows()
	{
		
		if (window.ysdk===undefined)
			return;		
		
		if (objects.ad_for_arrows_button.ready===false)
			return;
		
		window.ysdk.adv.showRewardedVideo({
			callbacks: {
				onRewarded: (function(wasShown) {arrows_bonus=5}).bind(process_6),
				onClose: (function(wasShown) {ad_finish()}).bind(process_6), 
				onError: (function(wasShown) {ad_finish()}).bind(process_6)
			}
		})
		
		
	}
	
	function ad_finish()
	{		
		anim.add_scl({obj:objects.ad_for_arrows_button,		param:'x',vis_on_end:false,func:'linear', val:[1,0],	speed:0.02});
		
		//показываем что получен бонус
		if (arrows_bonus===5)
		{
			objects.bonus.texture=game_res.resources["bonus_5"].texture;			
			obj:objects.bonus.y=700;
			anim.add_pos({obj:objects.bonus,		param:'x',vis_on_end:true,func:'easeOutElastic',val:[-90, 	90],	speed:0.02});
			
			setTimeout(function(){
								
				anim.add_pos({obj:objects.bonus,		param:'x',vis_on_end:false,func:'easeInBack',val:[90, 	-90],	speed:0.02, callback:function(){
				
				//по завершении
				objects.bonus.x=objects.bonus.sx;
				}
			})
			
			}, 3000);			
		}
		
	}
		
	function restart()
	{
		
		if (objects.retry_button.ready===false)
			return;
		
		//звук
		game_res.resources.click.sound.play();
		
		g_process=process_2;
		on_start=true;
		
		//убираем кнопки 
		anim.add_scl({obj:objects.retry_button,		param:'x',vis_on_end:false,func:'linear', val:[1,0],	speed:0.02});
		
		if (objects.ad_for_arrows_button.visible===true)
			anim.add_scl({obj:objects.ad_for_arrows_button,		param:'x',vis_on_end:false,func:'linear', val:[1,0],	speed:0.02});
		
		//убираем окно
		anim.add_pos({obj:objects.game_over,		param:'y',vis_on_end:false,func:'linear',val:['sy', 	800],	speed:0.02});
		


		
		g_process=process_2;
		on_start=true;
	}
	
	process_6.button_down=button_down;
	process_6.ad_for_arrows=ad_for_arrows;
	
	//тик
	game_tick++;
	
	//анимация
	anim.process();
	
}

//это эпизод паузы
function process_7()
{	

	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{		

		//звук
		game_res.resources.click.sound.play();
		
		//убираем ненужные объекты		
		anim.add_pos({obj:objects.pause_button,		param:'y',vis_on_end:false,func:'linear',val:['sy', 800], speed:0.025});
	
		//добавляем новые объекты
		anim.add_pos({obj:objects.pause_block,		param:'y',vis_on_end:true,func:'easeOutBack',val:[-510,	'sy'],	speed:0.025});
		anim.add_pos({obj:objects.resume_button,	param:'x',vis_on_end:true,func:'easeOutBack',val:[0, 'sx'],	speed:0.025});
		
	
		//другие инициализации
		on_start=false;
		
		//сбрасываем счетчик
		//game_tick=0;
	}
			
		
	//это нажатие кнопки
	function resume_button_down()
	{
		
		if (objects.resume_button.ready===false)
			return;
		
		//звук
		game_res.resources.click.sound.play();
		
		//убираем  объекты
		anim.add_pos({obj:objects.pause_block,		param:'y',vis_on_end:false,func:'easeInBack', val:['sy',-510],	speed:0.025});
		anim.add_pos({obj:objects.resume_button,	param:'x',vis_on_end:false,func:'easeInBack', val:['sx',-100],	speed:0.025});
		
		
		//добавляем кнопку паузы
		anim.add_pos({obj:objects.pause_button,	param:'y',vis_on_end:true,func:'easeOutBack',val:[800, 	'sy'],	speed:0.02});

		
		
		g_process=process_3;
		//on_start=true;
	}
	process_7.button_down=resume_button_down;
	
	//анимация
	anim.process();
}

//это заключительный эпизод
function process_8()
{	
	//событие которое вызывается один раз для инициализации
	if (on_start===true)
	{		

		//звук
		game_res.resources.music.sound.volume=1;
		game_res.resources.music.sound.play();
		
		//добавляем новые объекты
		anim.add_pos({obj:objects.game_end,	param:'y',vis_on_end:true,func:'linear',val:[-500, 	'sy'],	speed:0.05});
		
		//убираем паузу чтобы нельзя было нажать
		objects.pause_button.visible=false;
	
	
		//другие инициализации
		on_start=false;
	}
	
	
	//анимация
	anim.process();
}

//получаем или записываем данные об игроке из базы данных
function load_user_data_from_firebase()
{
	//запрашиваем мою информацию из бд или заносим в бд новые данные если игрока нет в бд
	firebase.database().ref().child("players/"+my_data.uid).get().then((snapshot) => {			
		var data=snapshot.val();
		
		var today = new Date();			
		my_data.pic_url=today.toISOString().substring(0, 10);
		
		if (snapshot.val()===null)
		{  
			firebase.database().ref("players/"+my_data.uid).set({first_name:my_data.first_name,  pic_url: my_data.pic_url, level:0});	
			my_data['db']='new';			
		}
		else
		{
			level=snapshot.val().level;
			//на всякий случай обновляет данные так как могло поменяться имя или фамилия или фото

			
			firebase.database().ref("players/"+my_data.uid).set({first_name:my_data.first_name, pic_url: my_data.pic_url,level:level});	
			my_data['db']='ok';		
		}
		activate_start_button();
		
	}).catch((error) => {
		console.error(error);
		my_data['db']='error';	
		activate_start_button();
	});
	
}	


var ups={
	
	show: function() {
		
		anim.add_pos({obj:objects.ups_block,	param:'x',vis_on_end:true,func:'linear', val:[-450,'sx'],	speed:0.02});
		anim.add_pos({obj:objects.ups_ok_button,	param:'x',vis_on_end:true,func:'linear', val:[450,'sx'],	speed:0.02});
		
	},
	
	close: function() {
		
		anim.add_pos({obj:objects.ups_block,	param:'x',vis_on_end:false,func:'linear', val:['sx',450],	speed:0.02});
		anim.add_pos({obj:objects.ups_ok_button,	param:'x',vis_on_end:false,func:'linear', val:['sx',-450],	speed:0.02});
		activate_start_button();
		
	}
	
	
}

function activate_start_button()
{	
	objects.button_1.texture=game_res.resources['button_1'].texture;	
	objects.button_1.interactive=true;
	objects.button_1.rotation=0;
}

var load_user_data={
		
	// эта функция вызывается один раз в начале игры
	
	req_result: "",
	yndx_no_personal_data:0,
			
	vk: function() {
		
		if(typeof(VK)==='undefined')
		{		
			load_user_data.req_result='vk_sdk_error';
			load_user_data.process_results();	
		}
		else
		{
			
			VK.init(
			
				//функция удачной инициализации вконтакте
				function()
				{

					VK.api(
						"users.get",
						{access_token: '03af491803af491803af4918d103d800b3003af03af491863c040d61bee897bd2785a50',fields: 'photo_100'},
						function (data) {
							if (data.error===undefined) {
								
								my_data.first_name=data.response[0].first_name;
								my_data.last_name=data.response[0].last_name;
								my_data.uid="vk"+data.response[0].id;
								my_data.pic_url=data.response[0].photo_100;
								load_user_data.req_result="ok";	
								load_user_data.process_results();	
								
							}	
							else
							{
								load_user_data.req_result="vk_error";	
								load_user_data.process_results();	
							}

						}
					)
					
				},	
				
				//функция неудачной инициализации вконтакте
				function()
				{
					load_user_data.req_result='vk_init_error';
					load_user_data.process_results();				
				},

				//версия апи
				'5.130');		
			
		}

	},

	yandex: function() {
	
		
		if(typeof(YaGames)==='undefined')
		{		
			this.req_result='yndx_sdk_error';
			this.process_results();	
		}
		else
		{
			//если sdk яндекса найден
			YaGames.init({}).then(ysdk => {
				
				//фиксируем SDK в глобальной переменной
				window.ysdk=ysdk;
				
				return ysdk.getPlayer();
			}).then((_player)=>{
				
				my_data.first_name 	=	_player.getName();
				my_data.last_name	=	"";
				my_data.uid			=	_player.getUniqueID().replace(/\//g, "Z");	
				my_data.pic_url		=	_player.getPhoto('medium');		
				
				console.log(my_data.uid);
				this.req_result='ok';
								
				if (my_data.first_name=="" || my_data.first_name=='')
					this.yndx_no_personal_data=1
				
			}).catch(err => {		
				console.log(err);
				this.req_result='yndx_init_error';			
			}).finally(()=>{			
				this.process_results();			
			})		
			
		}				

	},

	local: function() {	
		
		let test_id = prompt('Введите ID (будет добавле test)');
		
		this.req_result='ok'		
		my_data.first_name="LOCAL"+test_id; ;
		my_data.last_name="test"+test_id;
		my_data.uid="test"+test_id;
		my_data.pic_url=null;
		state="online";
		
		this.process_results();

	},
	
	process_results: function() {
		
					
		if (this.req_result==="ok") {
			load_user_data_from_firebase();	
		} else {			
			ups.show();
			my_data.uid = "";	
		}

	}
}

var tab_change=function(){
	
	if (document.hidden===true)
		game_res.resources.music.sound.stop();
	
}

function load_resources()
{	
	
	//добавляем из листа загрузки
	for (var i=0;i<load_list.length;i++)
		if (load_list[i][0]=="sprite" || load_list[i][0]=="image") 
			game_res.add(load_list[i][1], "res/"+load_list[i][1]+".png");
		
	//загружаем звуки
	game_res.add('baloon_burst','sounds/baloon_burst.mp3');
	game_res.add('win_level','sounds/win_level.mp3');
	game_res.add('click','sounds/click.mp3');
	game_res.add('warning','sounds/warning.mp3');
	game_res.add('arrow_send','sounds/arrow_send.mp3');
	game_res.add('multi','sounds/multi.mp3');
	game_res.add('arrows_bonus','sounds/arrows_bonus.mp3');
	game_res.add('freeze_bonus','sounds/freeze_bonus.mp3');
	game_res.add('lose','sounds/lose.mp3');
	game_res.add('brick','sounds/brick.mp3');
	game_res.add('music','sounds/music.mp3');
	game_res.add('speedup','sounds/speedup.mp3');
	
	//добавляем шрифт
	game_res.add('m_font','m_font.fnt');

	game_res.load(load_complete);		
	game_res.onProgress.add(progress);
	
	function load_complete()
	{		
		document.getElementById("m_bar").outerHTML = "";		
		document.getElementById("m_progress").outerHTML = "";
		
		app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:true,backgroundColor : 0x060600});
		//app.renderer.autoResize=true;
		resize(window.innerWidth,window.innerHeight);
		window.addEventListener("resize", resize);
				
				
		document.addEventListener("visibilitychange", tab_change);
				
		document.body.appendChild(app.view);
		document.body.style.backgroundColor = "blue";
				
		//создаем спрайты и массивы спрайтов и запускаем первую часть кода
		for (var i=0;i<load_list.length;i++) {			
			const obj_class=load_list[i][0];
			const obj_name=load_list[i][1];

			switch(obj_class)
			{			
				case "sprite":
					objects[obj_name]=new PIXI.Sprite(game_res.resources[obj_name].texture);
					eval(load_list[i][2]);
				break;
				
				case "block":
					eval(load_list[i][2]);						
				break;
				
				case "cont":
					eval(load_list[i][2]);						
				break;

				case "array":
					var a_size=load_list[i][2];
					objects[obj_name]=[];
					for (var n=0;n<a_size;n++)
						eval(load_list[i][3]);		
				break;
			}
		}
		
		//обрабатываем вторую часть кода в объектах
		for (var i=0;i<load_list.length;i++) {			
			const obj_class=load_list[i][0];
			const obj_name=load_list[i][1];

			switch(obj_class)
			{			
				case "sprite":
					eval(load_list[i][3]);
				break;
				
				case "block":
					eval(load_list[i][3]);						
				break;
				
				case "cont":
					eval(load_list[i][3]);						
				break;

				case "array":
					var a_size=load_list[i][2];
					for (var n=0;n<a_size;n++)
						eval(load_list[i][4]);		
				break;
			}
		}
				
				
		//кнопка запуска сначала не загружена
		objects.button_1.texture=game_res.resources['button_1_loading'].texture;	
				
		//загружаем данные из базы данных
		load_user_data.yandex();				

		//запускаем заставку
		g_process=process_1;
		on_start=true;		
		main_loop();	

	}
	
	function progress(loader, resource)
	{
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	}
	
}

function main_loop()
{
	g_process();
    app.render(app.stage);
	requestAnimationFrame(main_loop);
}


