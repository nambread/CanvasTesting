var g_Canvas = null;
var g_CanvasObjects = [];
var g_ImageObj = null;
var g_ScreenShotLocation = null;
var g_DrawObjType = 0;
var g_TempDrawObj = null;
var g_Drawing;
var g_DrawingStartPos;
var g_CurrentColour;

//Canvas Object Classes
//Circle Class
cCircle = function(pos, radius, brushWidth, colour) {
	this.position = pos;
	this.radius = radius;
	this.brushWidth = brushWidth;
	this.colour = colour;
}
cCircle.prototype ={
	//Draw
	Draw: function(canvasContext) {
		canvasContext.beginPath();
		canvasContext.arc(	this.position.x, this.position.y,
							this.radius, 0, 2 * Math.PI,
							false);
		canvasContext.lineWidth = this.brushWidth;
		canvasContext.strokeStyle = this.colour;
		canvasContext.stroke();
		canvasContext.closePath();
	}
}

//Box Class
cBox = function(pos, height, width, brushWidth, colour) {
	this.position = pos;
	this.height = height;
	this.width = width;
	this.brushWidth = brushWidth;
	this.colour = colour;
}
cBox.prototype = {
	//Draw
	Draw: function(canvasContext) {
		canvasContext.beginPath();
		canvasContext.rect(	this.position.x, this.position.y,
							this.width, this.height);
		canvasContext.lineWidth = this.brushWidth;
		canvasContext.strokeStyle = this.colour;
		canvasContext.stroke();
		canvasContext.closePath();
	}
}

//Text Class
cText = function(pos, style, text, colour) {
	this.position = pos;
	this.fontStyle = style;
	this.text = text;
	this.colour = colour;
}
cText.prototype ={
	//Draw
	Draw: function(canvasContext) {
		canvasContext.font = this.fontStyle;
		canvasContext.fillText(this.text, this.position.x, this.position.y)
	}
}

//General Functions
function initCanvasTest() {
	g_Canvas = document.getElementById("mCanvas");
	g_Canvas.addEventListener('mousedown', OnMouseDown, false);
	g_Canvas.addEventListener('mousemove', OnMouseMove, false);
	g_Canvas.addEventListener('mouseup', OnMouseUp, false);
	g_ImageObj = null;
	g_Drawing = false;
	g_ScreenShotLocation = "D:\\test.Jpg";
	g_CanvasObjects.length = 0;
	g_CurrentColour = document.getElementById("colourPicker").value;
	console.log("Hello World!")
}

function GetScreenshot() {
	console.log("Grabbing Screenshot!");
	g_ImageObj = new Image();
	g_ImageObj.onload = function(){
		var ctx = g_Canvas.getContext("2d");
		ctx.drawImage(g_ImageObj, 0, 0);
	}
	g_ImageObj.src = g_ScreenShotLocation;
}

function Undo() {
	console.log("Undoing!");
	g_CanvasObjects.pop();
	OnCanvasChange();
}

function OnCanvasChange()
{
	var ctx = g_Canvas.getContext("2d");
	ctx.drawImage(g_ImageObj, 0, 0);
	for (i = 0 ; i < g_CanvasObjects.length ; i++) {
		g_CanvasObjects[i].Draw(ctx);
	}
	if (g_TempDrawObj != null)
	{
		g_TempDrawObj.Draw(ctx);
	}
}

function ChangeColour(newColour)
{
	if (newColour.length == 7)
	{
		console.log("Color is now: " + newColour);
		g_CurrentColour = newColour;
	}
}

function ChangeDrawType(ID)
{
	if (ID == "CircleBtn")
		{ g_DrawObjType = 0; }
	if (ID == "RectBtn")
		{ g_DrawObjType = 1; }
	if (ID == "TextBtn")
		{ g_DrawObjType = 2; }
}

function GetMousePos(event)
{
	var rect = g_Canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function GetDistance(mousePos1, mousePos2)
{
	var v = {
		x: mousePos2.x - mousePos1.x,
		y: mousePos2.y - mousePos1.y
	}
	return Math.sqrt((v.x * v.x) + (v.y * v.y));
}

function GetResultant(mousePos1, mousePos2)
{
	return{
		x: mousePos2.x - mousePos1.x,
		y: mousePos2.y - mousePos1.y
	};
}

function OnMouseDown(event) {
	if(g_ImageObj != null) {
		console.log("Mouse Down!")
		if (g_DrawObjType == 2)
		{
			g_Typeing = true;
			g_DrawingStartPos = GetMousePos(event);
			OnCanvasChange();
		}
		else
		{
			g_Drawing = true;
			g_DrawingStartPos = GetMousePos(event);
			OnCanvasChange();
		}
	}
}

function OnMouseMove(event)
{
	if (g_ImageObj != null)
	{
		if(g_Drawing)
		{
			console.log("Dragging!");
			var curMousePos = GetMousePos(event);
			switch(g_DrawObjType) {
				case 0: //Circle
					var dist = GetDistance(g_DrawingStartPos, curMousePos);
					g_TempDrawObj = new cCircle(g_DrawingStartPos, dist, 4, g_CurrentColour);
					break;
				case 1: //Box
					var resultant = GetResultant(g_DrawingStartPos, curMousePos);
					g_TempDrawObj = new cBox(g_DrawingStartPos, resultant.y, resultant.x, 4, g_CurrentColour);
					break;
			}
			OnCanvasChange();
		}
	}
}

function OnMouseUp(event)
{
	g_Drawing = false;
	if (g_ImageObj != null) {
		console.log("Mouse Up!")
		if (g_Drawing) {
			g_CanvasObjects.push($.extend(true, {}, g_TempDrawObj));
			g_TempDrawObj = null;
		}
		OnCanvasChange();
	}
}

function HandleKeyPress(e)
{
	var charCode = (typeof e.which == "number") ? e.which : e.keycode;
	if (charCode == 26)
	{
		Undo();
	}
	if (g_Typeing)
	{
		if (charCode == 13)
		{
			g_CanvasObjects.push($.extend(true, {}, g_TempDrawObj));
			g_TempDrawObj = null;
			g_Typeing = false;
		}
		var curText = "";
		if (g_TempDrawObj != null)
		{
			curText = g_TempDrawObj.text;
		}
		if (charCode != 8)
		{
			curText += String.fromCharCode(charCode);
		}
		else
		{
			curText
		}
		
		g_TempDrawObj = new cText(g_DrawingStartPos, '40pt Calibri', curText, g_CurrentColour);
		OnCanvasChange();
	}
}