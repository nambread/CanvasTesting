var g_Canvas = null;
var g_CanvasObjects = [];
var g_ImageObj = null;
var g_ScreenShotLocation = null;
var g_DrawObjType = 0;
var g_TempDrawObj = null;
var g_Drawing;
var g_DrawingStartPos;
var g_TextBox;
var g_CurrentColour;
var g_FontStyle;

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
cText = function(pos, height, width, size, text, colour) {
	this.position = pos;
	this.height = height;
	this.width = width;
	this.fontSize = size;
	this.text = text;
	this.colour = colour;
}
cText.prototype ={
	//Draw
	Draw: function(canvasContext) {
		var letters = this.text.substr('');
		console.log(letters);
		canvasContext.font = "" + fontSize + "pt " + g_FontStyle;
		canvasContext.fillText(this.text, this.position.x, this.position.y + this.fontSize);
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
	g_Typeing = false;
	g_ScreenShotLocation = "D:\\CanvasTesting\\test.Jpg";
	g_CanvasObjects.length = 0;
	g_CurrentColour = document.getElementById("colourPicker").value;
	g_FontStyle = "Calibri";
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

function CommitTempObject()
{
	g_CanvasObjects.push($.extend(true, {}, g_TempDrawObj));
	g_TempDrawObj = null;
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
	return {
		x: mousePos2.x - mousePos1.x,
		y: mousePos2.y - mousePos1.y
	};
}

function OnMouseDown(event) {
	if(g_ImageObj != null) {
		console.log("Mouse Down!")
		if (g_Typeing)
		{
			CommitTempObject();
			g_Typeing = false;
		}
		g_Drawing = true;
		g_DrawingStartPos = GetMousePos(event);
		OnCanvasChange();
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
				case 2: //TextBox
					var resultant = GetResultant(g_DrawingStartPos, curMousePos);
					g_TempDrawObj = new cBox(g_DrawingStartPos, resultant.y, resultant.x, 2, g_CurrentColour);
					break;
			}
			OnCanvasChange();
		}
	}
}

function OnMouseUp(event)
{
	if (g_ImageObj != null) {
		console.log("Mouse Up!")
		if (g_Drawing) {
			if (g_DrawObjType != 2)
			{
				CommitTempObject();
				g_Drawing = false;	
			}
			else
			{
				if (g_TempDrawObj != null)
				{
					g_TextBox = {
						x: (g_TempDrawObj.width == null) ? 0 : g_TempDrawObj.width,
						y: (g_TempDrawObj.height== null) ? 0 : g_TempDrawObj.height
					};
				}
				else 
				{
					g_TextBox = GetMousePos(event);
				}
				g_Typeing = true;
				g_Drawing = false;
				g_TempDrawObj = cText(g_DrawingStartPos, g_TextBox.y, g_TextBox.x, 40, "", g_CurrentColour);
			}
		}
		OnCanvasChange();
	}
}

function HandleKeyPress(e)
{
	var charCode = (typeof e.which == "number") ? e.which : e.keycode;
	console.log(charCode);
	if (charCode == 90)
	{
		g_TempDrawObj = null;
		g_Typeing = false;
		Undo();
	}
	if (g_Typeing)
	{
		var curText = (g_TempDrawObj != null) ? g_TempDrawObj.text : "";
		if (charCode != 8)
		{
			curText += String.fromCharCode(charCode);
		}
		else
		{
			var textLen = curText.length;
			curText = curText.substr(0, textLen - 1);
		}
		g_TempDrawObj = new cText(g_DrawingStartPos, g_TextBox.y, g_TextBox.x, 40, curText, g_CurrentColour);
		OnCanvasChange();
	}
}