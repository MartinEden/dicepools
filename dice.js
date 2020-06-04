function DicePoolTable(container, options)
{
    if (!options)
        options = {};
    this.sides = getOptionOrDefault(options, "sides", 6);
    this.targetNumber = getOptionOrDefault(options, "targetNumber", 4);    
    this.minCount = 1;
    this.maxCount = getOptionOrDefault(options, "poolSize", 6);
    this.minTarget = 1;
    this.maxTarget = getOptionOrDefault(options, "targetSuccessCount", 6);
    this.decimalPlaces = getOptionOrDefault(options, "decimalPlaces", 2);
    this.version = 1.03;
    
    this.container = $(container).addClass("dice-pool-container");    
    this.render();
    this.createControls();
}
DicePoolTable.prototype.makeDistribution = function(poolSize)
{   
    var p = (this.sides + 1 - this.targetNumber) / this.sides;    
    return new Binomial(poolSize, p);
}
DicePoolTable.prototype.render = function()
{
    this.table = $("<table></table>")
        .addClass("results");
        
    this._renderHorizontalLabel();
    this._renderHeaderRow();    
    this._renderData();
    
    this.container.find(".results").remove();
    this.container.prepend(this.table);
}
DicePoolTable.prototype._renderHorizontalLabel = function()
{
    var row = $("<tr></tr>")
        .append($("<td></td>").addClass("label").addClass("no-border"))
        .append(this._makeHorizontalLabel());
    this.table.append(row);
}
DicePoolTable.prototype._renderHeaderRow = function()
{
    var me = this;
    var header = $("<tr></tr>");
    header.append(this._makeVerticalLabel());
    var about = $("<a></a>")
        .attr("href", "#info")
        .addClass("information-link")
        .text("?")
        .click(function() {
            event.preventDefault();
            me.showInformation(); 
        });    
    header.append($("<th></th>").append(about));
    for (var target = this.minTarget; target <= this.maxTarget; target++)
    {
        header.append($("<th></th>").text(target));
    }
    this.table.append(header);
}
DicePoolTable.prototype._renderData = function()
{    
    for (var count = this.minCount; count <= this.maxCount; count++)
    {
        var row = $("<tr></tr>");
        row.append($("<td></td>").text(count));
        var distribution = this.makeDistribution(count)
        for (var target = this.minTarget; target <= this.maxTarget; target++)
        {
            var p = distribution.atLeast(target);
            var cell = $("<td></td>").text(round(p, this.decimalPlaces));
            row.append(cell);
        }
        this.table.append(row);
    }
}
DicePoolTable.prototype._makeHorizontalLabel = function()
{
    this.horizontalLabel = $("<td></td>")
        .attr("colspan", this.maxTarget - this.minTarget + 2)
        .text("Target number of successes")
        .addClass("label")
        .addClass("horizontal")
        .addClass("no-border");
    return this.horizontalLabel;
}
DicePoolTable.prototype._makeVerticalLabel = function()
{
    return $("<td></td>")
        .attr("rowspan", this.maxCount - this.minCount + 2)  
        .addClass("vertical")   
        .addClass("label")
        .addClass("no-border")  
        .text("Number of dice");
}
DicePoolTable.prototype.showInformation = function()
{
    var info = $("<div></div>")
        .addClass("information")
        .width(this.table.width())
        .height(this.table.height())
        .css("opacity", 0);
    var contents = $("<div></div>")
        .addClass("contents")
        .append($("<p></p>")
            .append($("<a></a>").text("About this app").attr("href", "http://weaving-stories.blogspot.co.uk/2013/05/dice-pools-probabilities.html"))
            .append(" | ")
            .append($("<a></a>").text("Source code").attr("href", "https://github.com/MartinEden/dicepools/"))
        )
        .append($("<p></p>").text("Version: " + this.version))
        .append($("<p></p>")
            .append("Released under ")
            .append($("<a></a>").text("this licence").attr("href", "https://dice-pools.surge.sh/license.txt"))
            .append("."))
        .append($("<p></p>")
            .append($("<a></a>").text("Close").attr("href", "#").click(function() {
                event.preventDefault();
                info.animate({ opacity: 0 }, { 
                    complete: function() { info.remove(); } 
                });
            })));
    info.append(contents);
    this.container.append(info);
    info.animate({ opacity: 1 });
}
DicePoolTable.prototype.toggleControls = function()
{
    if (this.visible)
    {
        var targetWidth = this._getControlsTargetWidth();        
        this.controls.animate({ 
            "margin-left": -targetWidth - 1,
            "width": targetWidth,
        });
    }
    else
    {   
        // animate to target width by temporarily setting the element
        // to auto and getting the width then
        var curWidth = this.controls.width();
        this.controls.css('width', 'auto');
        var autoWidth = this.controls.width();
        this.controls.width(curWidth).animate({ 
            width: autoWidth, 
            "margin-left": -1,
        });
    }
    this.visible = !this.visible;
}
DicePoolTable.prototype.createControls = function()
{
    var me = this;
    this.visible = false;
    
    var t = $("<table></table>")
        .append(me._makeControl("Number of dice",
            me.maxCount, function(value) { me.maxCount = value; }))
        .append(me._makeControl("Target number of successes",
            me.maxTarget, function(value) { me.maxTarget = value; }))
        .append(me._makeControl("Sides on each die", 
            me.sides, function(value) { me.sides = value; }))
        .append(me._makeControl("Target number for a success", 
            me.targetNumber, function(value) { me.targetNumber = value; }))
        .append(me._makeControl("Decimal places",
            me.decimalPlaces, function(value) { me.decimalPlaces = value; }));        
        
    this.controls = $("<div></div>")
        .addClass("controls")
        .append(me._makeToggleButton())
        .append(t);       
    this.container.append(this.controls);
    this.controls.css("width", this._getControlsTargetWidth())
        .css("margin-left", -this._getControlsTargetWidth() - 1) 
}
DicePoolTable.prototype._getControlsTargetWidth = function()
{    
    var targetWidth = this.controls.width();
    if (this.controls.width() > this.horizontalLabel.width())
    {
        var targetWidth = this.horizontalLabel.width() - 1;
    }
    return targetWidth;
}
DicePoolTable.prototype._makeToggleButton = function()
{
    var me = this;
    return $("<div></div>")
        .addClass("toggle")
        .click(function() { me.toggleControls() })
        .append($("<img />").attr("src", "https://dice-pools.surge.sh/gear.png"));
}
DicePoolTable.prototype._makeControl = function(label, value, callback)
{
    var me = this;
    var input = $("<input />")
        .attr("type", "number")
        .val(value)
        .change(function() {
            var v = $(this).val();
            callback(parseInt(v));
            me.render();      
        });
    return $("<tr></tr>")
        .addClass("control")
        .append($("<td></td").text(label))
        .append($("<td></td>").append(input));
}

function Binomial(n, p)
{
    this.n = n;
    this.p = p;
}
Binomial.prototype.coefficient = function(k)
{
    return factorial(this.n) 
        / (factorial(k) * factorial(this.n - k));
}
// Probability of exactly k successes out of n
Binomial.prototype.exactly = function(k)
{
    if (k > this.n || k < 0)
        return 0;
    
    return this.coefficient(k) 
        * Math.pow(this.p, k)
        * Math.pow(1 - this.p, this.n - k);        
}
// Probability of at most k successes out of n
Binomial.prototype.atMost = function(k)
{
    var total = 0;
    for (var i = 0; i <= k; i++)
    {
        total += this.exactly(i);
    }
    return total;
}
// Probability of at least k successes out of n
Binomial.prototype.atLeast = function(k)
{
    if (k == 0)
        return 1;
    else
        return 1 - this.atMost(k - 1);
}

var factorials = new Array();
function factorial(n) {
  if (n == 0 || n == 1)
  {
      return 1;
  }
  if (factorials[n] > 0)
  {
      return factorials[n];
  }
  else
  {
      return factorials[n] = factorial(n - 1) * n;
  }
}
function round(number, places) {
    return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
}
function getOptionOrDefault(object, property, defaultValue) {
    if (object.hasOwnProperty(property))
        return object[property];
    else
        return defaultValue;
}
