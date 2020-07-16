var sw = 20,	//一个方块的宽度
	sh = 20,	//一个方块的长度
	tr = 30,	//行数
	td = 30;	//列数
var snake = null, //蛇的实例
	food = null,//食物的实例
	game = null;//游戏的实例

//创建方块的构造函数
function Square(x, y, classname) {
	/*0,0	0,0`
	 20,0	1,0
	 40,0	2,0	
	*/
	this.x = x * sw;
	this.y = y * sh;
	this.class = classname;

	this.viewContent = document.createElement('div');	//方块对应的dom元素
	this.viewContent.className = this.class;
	this.parent = document.getElementById("snakeWrap");	//方块对应的父级
}

Square.prototype.create = function () { //创建方块dom，并添加到页面去
	this.viewContent.style.position = "absolute";
	this.viewContent.style.width = sw +"px";
	this.viewContent.style.height = sh + "px";
	this.viewContent.style.left = this.x + "px";
	this.viewContent.style.top = this.y + "px";

	this.parent.appendChild(this.viewContent);
}

Square.prototype.remove = function () {
	this.parent.removeChild(this.viewContent);
}

//蛇
function Snake() {
	this.head = null;	//存一下蛇的头部
	this.tail =null;	//存一下蛇的尾部
	this.pos = [];		//存储蛇身体的每一块方块的位置

	this.directionNum = {	//存储蛇走的方向，用对象表示
		left : {
			x : -1,
			y : 0,
			rotate : 180	//蛇头在不同方向中应该进行旋转，要不始终向右
		},
		right : {
			x : 1,
			y : 0,
			rotate : 0
		},
		up : {
			x : 0,
			y : -1,
			rotate : -90
		},
		down : {
			x : 0,
			y : 1,
			rotate : 90
		},
	}
}

//初始化
Snake.prototype.init = function () {
	//创建蛇头
	var snakeHead = new Square(2, 0, "snakeHead");
	snakeHead.create();
	this.head = snakeHead;	//储存蛇头信息
	this.pos.push([2, 0]);	//将蛇头的位置储存起来

	//创建蛇身体1
	var snakeBody1 = new Square(1, 0, "snakeBody");
	snakeBody1.create();
	this.pos.push([1, 0]);	//将蛇身体1的位置储存起来

	//创建蛇身体2
	var snakeBody2 = new Square(0, 0, "snakeBody");
	snakeBody2.create();
	this.tail = snakeBody2;	//存储蛇尾信息
	this.pos.push([0, 0]);	//将蛇身体1的位置储存起来

	//创建链表关系
	snakeHead.last = null;
	snakeHead.next = snakeBody1;

	snakeBody1.last = snakeHead;
	snakeBody1.next = snakeBody2;

	snakeBody2.last = snakeBody1;
	snakeBody2.next = null;

	//表示蛇走的方向
	this.direction = this.directionNum.right;	//默认让蛇往右走
}

//这个方法用来获取蛇头下一步的位置对应的元素，要根据元素做不同的事情
Snake.prototype.getnextPos = function () {
	var nextPos = [
		(this.head.x / sw) + this.direction.x,
		(this.head.y / sh) + this.direction.y
	]
	
	//下一个点是自己，就是撞到了自己，游戏结束
	var selfCollied = false;	//是否撞到了自己
	this.pos.forEach(function (value) {
		if(value[0] == nextPos[0] && value[1] == nextPos[1]) {
			//如果两个数组的两个数都相同，就说明下个点在蛇身上能找到，代表撞到了自己
			selfCollied = true;
		}
	})
	if(selfCollied) {
		//console.log("撞到自己了!");
		this.strategies.die.call(this);
		return ;
	}

	//下一个点是墙，游戏结束
	if(nextPos[0] < 0 || nextPos[0] > (td - 1) || nextPos[1] < 0 || nextPos[1] > (tr - 1)) {
		//console.log("撞墙了！");
		this.strategies.die.call(this);
		return ;
	}

	//下一个点是食物，吃
	if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
		//如果这个条件成立，说明蛇头现在要走的下一个点是食物的那个点
		//console.log("吃到食物了");
		this.strategies.eat.call(this);
		return ;
	}
	//this.strategies.eat();

	//下一个点什么都不是，走
	this.strategies.move.call(this);

}

//处理碰撞后要做的事
Snake.prototype.strategies = {
	move : function (format) {	//这个参数用来决定是否删除最后一个方块（蛇尾），当传了这个参数后，表示的是要吃
		var newBody = new Square((this.head.x / sw),(this.head.y / sh),"snakeBody");
		//更新链表关系
		newBody.next = this.head.next;
		newBody.next.last = newBody;
		newBody.last = null;

		this.head.remove();	//把旧蛇头从原来位置删去
		newBody.create();

		//创建新的蛇头（蛇头下一个要走的点，nextPos）
		var newHead = new Square(((this.head.x / sw) + this.direction.x),((this.head.y / sh) + this.direction.y),"snakeHead");
		//更新链表关系
		newHead.next = newBody;
		newHead.last = null;
		newBody.last = newHead;
		newHead.viewContent.style.transform = "rotate(" + this.direction.rotate + "deg)";	//蛇头跟着方向键的方向转
		newHead.create();

		//蛇身上的每一块坐标也要更新
		this.pos.splice(0, 0, [((this.head.x / sw) + this.direction.x),((this.head.y / sh) + this.direction.y)]);
		this.head = newHead;	//把this.head的信息更新一下

		if(!format) {	//format为false 表示需要删除（除了吃之外的操作）
			this.tail.remove();
			this.tail = this.tail.last;

			this.pos.pop();
		}
	},
	eat : function () {
		this.strategies.move.call(this,true);
		createFood();
		game.score ++;
	},
	die : function () {
		game.over();
	}
}

snake = new Snake();


//创建食物
function createFood() {
	var x = null,
		y = null;

	var include = true;
	while(include) {
		x = Math.round(Math.random() * (td - 1));	//round四舍五入
		y = Math.round(Math.random() * (tr - 1));

		snake.pos.forEach(function (value) {	//value表示pos里面的每一个内容	pos里面的都是数组[[2,0], [1,0], [0,0]]
			if(x != value[0] && y != value[1]) {
				include = false;
			}
		})
	}
	food = new Square(x, y, "food");
	food.pos = [x, y];	//存储一下食物的位置，用于跟蛇要走的下一个点的位置做对比
	var foodDom = document.getElementsByClassName("food")[0];
	if(foodDom) {
		foodDom.style.left = (x * sw) + "px";
		foodDom.style.top = (y * sh) + "px";
	}else {
		food.create();
	}
}


//创建游戏
function Game() {
	this.timer = null;
	this.score = 0;
}

Game.prototype.init = function () {
	snake.init();	//snake.init 要在 createFood 前面
	createFood();	//因为createFood里面用到了snake的pos，这个是在init里面添加的
	//snake.getnextPos();

	document.onkeydown = function (ev) {
		if(ev.which == 37 && snake.direction != snake.directionNum.right) {
			snake.direction = snake.directionNum.left;
		}else if(ev.which == 38 && snake.direction != snake.directionNum.down) {
			snake.direction = snake.directionNum.up;
		}else if(ev.which == 39 && snake.direction != snake.directionNum.left) {
			snake.direction = snake.directionNum.right;
		}else if(ev.which == 40 && snake.direction != snake.directionNum.up) {
			snake.direction = snake.directionNum.down;
		}
	}

	this.start();
}

Game.prototype.start = function () {	//开始游戏
	this.timer = setInterval(function () {
		snake.getnextPos();
	}, 200)
}

Game.prototype.pause = function () {
	clearInterval(this.timer);
}

Game.prototype.over = function () {
	clearInterval(this.timer);	//清除定时器
	alert("你的得分为:" + this.score);

	var snakeWrap = document.getElementById("snakeWrap");	//清除页面的蛇和苹果
	snakeWrap.innerHTML = "";

	snake = new Snake();	//清除实例蛇和游戏
	game = new Game();

	var stratBtnWrap = document.getElementsByClassName("startBtn")[0];	//游戏结束，回到初始界面
	stratBtnWrap.style.display = "block";
}

game = new Game();
//开始游戏
var startBtn = document.getElementsByTagName('button')[0];
startBtn.onclick = function () {
	startBtn.parentNode.style.display = "none";
	game.init();
}

var snakeWrap = document.getElementById("snakeWrap");
var pauseBtn = document.getElementsByTagName('button')[1];
snakeWrap.onclick = function () {
	game.pause();
	pauseBtn.parentNode.style.display = "block";
}

pauseBtn.onclick = function () {
	game.start();
	pauseBtn.parentNode.style.display = "none";
}





