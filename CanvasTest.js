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
var g_ToolOptions;

//Canvas Object Classes
//Circle Class
cCircle = function(pos, radius, brushWidth, colour) {
	this.position = pos;
	this.radius = radius;
	this.brushWidth = brushWidth;
	this.colour = colour;
}

cCircle.prototype.Draw = function(canvasContext) {
	canvasContext.beginPath();
	canvasContext.arc(	this.position.x, this.position.y,
						this.radius, 0, 2 * Math.PI,
		   				false);
	canvasContext.lineWidth = this.brushWidth;
	canvasContext.strokeStyle = this.colour;
	canvasContext.stroke();
	canvasContext.closePath();
}

cCircle.prototype.isValid = function () {
    if (this.radius > 0) {
        return true;
    } else {
        return false;
    }
}

cCircle.prototype.getConfigurableOptions = function(){
    return {
        lineWidth: 2,
        colour: g_CurrentColour
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
cBox.prototype.Draw = function(canvasContext) {
	canvasContext.beginPath();
	canvasContext.rect(	this.position.x, this.position.y,
						this.width, this.height);
	canvasContext.lineWidth = this.brushWidth;
	canvasContext.strokeStyle = this.colour;
	canvasContext.stroke();
	canvasContext.closePath();
}

cBox.prototype.isValid = function () {
    if (this.width + this.height > 0) {
        return true;
    } else {
        return false;
    }
}

//Text Class
cText = function(pos, height, width, size, text, colour, boundingRect) {
	this.position = pos;
	this.height = height;
	this.width = width;
	this.fontSize = size;
	this.text = text;
	this.colour = colour;
	this.lines = [''];
	this._hasFocus = true;
	this.boundingRect = boundingRect;
}

cText.prototype.Draw = function (canvasContext) {
    if (this.hasFocus()) {
        this.boundingRect.Draw(canvasContext);
    }
	canvasContext.font = "" + this.fontSize + "pt " + g_FontStyle;
	var x = this.position.x;
	var y = this.position.y + this.fontSize;
	for (var i = 0 ; i < this.lines.length ; i++)
	{
		canvasContext.fillText(this.lines[i], x, y);
		y += (this.fontSize + 3);
	}
	console.log(this.lines);
}

cText.prototype.isValid = function () {
    if (this.lines.length >= 1 && this.lines[0].length >= 1) {
        return true;
    } else {
        return false;
    }
}

cText.prototype.hasFocus = function () {
    return this._hasFocus;
}

cText.prototype.setFocus = function (bool) {
    this._hasFocus = bool == true ? true : false;
}


//AddText
cText.prototype.AddText = function(newChar) {
		var numLines = this.lines.length;
		var lastLine = this.lines[numLines - 1];
		var testLine = lastLine + newChar;
		console.log(testLine);
		var lineWidth = g_Canvas.getContext("2d").measureText(testLine).width;
		if (lineWidth > this.width)
		{
			console.log("Char is over limit");
			this.lines.push(newChar);
		}
		else
		{
			this.lines[numLines -1] = testLine;
		}
		OnCanvasChange();
}

cText.prototype.backspace = function() {
	var numLines = this.lines.length;
	var lastLine = this.lines[numLines - 1];
	if (lastLine.length > 0)
	{
		this.lines[numLines - 1] = lastLine.substr(0, lastLine.length - 1);
	}
	else
	{
		this.lines.pop();
		lastLine = this.lines[numLines - 2];
		this.lines[numLines - 2] = lastLine.substr(0, lastLine.length - 1);
	}
}

//Options object for tools
ToolsOptions = function (tool, uiPath) {
    this.uiPath = uiPath;
    this.tool = tool;
    $.extend(true, this, tool.getConfigurableOptions());
}

ToolsOptions.prototype.bindToUI = function (html, status, xhr) {
    console.log(html);
    this.tool = nulll;
}

ToolsOptions.prototype.throwError = function (xhr, status, error) {
    console.log(status + " " + error);
    this.tool = null;
}



//General Functions
function initCanvasTest() {
    var toolbar = $(".toolbar")[0];

    toolbar.addEventListener('click', ChangeDrawType);

	g_Canvas = document.getElementById("mCanvas");
	g_Canvas.addEventListener('mousedown', OnMouseDown, false);
	
	g_ImageObj = null;
	g_Drawing = false;
	g_Typeing = false;
	g_ScreenShotLocation = "test.jpg";
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
	for (var i = 0 ; i < g_CanvasObjects.length ; i++) {
		g_CanvasObjects[i].Draw(ctx);
	}
	if (g_TempDrawObj != null)
	{
		g_TempDrawObj.Draw(ctx);
	}
}

function CommitTempObject(tempObject)
{
    if (tempObject != null) {
        if (tempObject.isValid()) {
            g_CanvasObjects.push($.extend(true, {}, g_TempDrawObj));
            g_TempDrawObj = null;
        }
        else {
            console.log("Object isn't valid so isn't being added to the CanvasObject stack.")
        }
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

function ChangeDrawType(event)
{
    if (event.target.id == "CircleBtn")
    {
        g_ToolOptions = new ToolsOptions(new cCircle(),'ToolOptionsCircle.html')
        g_DrawObjType = 0;
    }
	if (event.target.id == "RectBtn")
		{ g_DrawObjType = 1; }
    if (event.target.id == "TextBtn")
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
		    g_TempDrawObj.setFocus(false);
			CommitTempObject(g_TempDrawObj);
			g_Typeing = false;
		}
        g_Drawing = true;
        var curMousePos = GetMousePos(event);
        g_DrawingStartPos = GetMousePos(event);
        switch (g_DrawObjType) {
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
	g_Canvas.removeEventListener('mousedown', OnMouseDown, false);
	g_Canvas.addEventListener('mousemove', OnMouseMove, false);
	g_Canvas.addEventListener('mouseup', OnMouseUp, false);
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
					g_TempDrawObj = new cCircle(g_DrawingStartPos, dist, g_ToolOptions.lineWidth, g_ToolOptions.colour);
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
				CommitTempObject(g_TempDrawObj);
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
				var boundingRect = g_TempDrawObj;
				g_TempDrawObj = new cText(g_DrawingStartPos, g_TextBox.y, g_TextBox.x, 40, "", g_CurrentColour, boundingRect);
				g_TempDrawObj.setFocus(true);
			}
		}
		OnCanvasChange();
	}
	g_Canvas.removeEventListener('mousemove', OnMouseMove, false);
	g_Canvas.removeEventListener('mouseup', OnMouseUp, false);
	g_Canvas.addEventListener('mousedown', OnMouseDown, false);
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
		if (!g_TempDrawObj)
		{
			g_TempDrawObj = new cText(g_DrawingStartPos, g_TextBox.y, g_TextBox.x, 40, "", g_CurrentColour);
		}
		if (charCode != 8)
		{
			if (e.shiftKey)
			{
				g_TempDrawObj.AddText(String.fromCharCode(charCode));
			}
			else
			{
				g_TempDrawObj.AddText(String.fromCharCode(charCode).toLowerCase());
			}
			
		}
		else
		{
			g_TempDrawObj.backspace();
		}
		
		OnCanvasChange();
	}
}