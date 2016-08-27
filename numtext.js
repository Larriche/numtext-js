/***************************************************************************
* Numtext
*
* A library for converting numbers from their numeric forms to their English
* text equivalent and vice versa for numbers in denominations up to
* quadrillion. I believe this denomination is enough for it to be useful 
* to developers.
*
* This library is open source according to the MIT License as follows.
*
* Copyright (c) 2016 Richman Larry Clifford
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.  
*/


function Numtext()
{
	/*  Constructor */

	this.numbers = [];

	for(var i = 0;i <= 20;i++){
		this.numbers.push(i);
	}

	for(var i = 30;i <= 90;i += 10){
		this.numbers.push(i);
	}

    this.textValues = ["zero" , "one" , "two" ,"three" , "four" ,"five" ,"six" ,"seven",
          "eight" ,"nine" ,"ten","eleven", "twelve", "thirteen", "fourteen",
          "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
          "thirty", "fourty", "fifty", "sixty", "seventy", "eighty", "ninety" ];

    
    this.maxDigitMappings = new Map();
    this.maxDigitMappings.set(6 , 'thousand');
    this.maxDigitMappings.set(9 , 'million');
    this.maxDigitMappings.set(12 , 'billion');
    this.maxDigitMappings.set(15, 'trillion');
    this.maxDigitMappings.set(18 , 'quadrillion');

    
    this.powers = new Map();
    this.powers.set('hundred' , 2);
    this.powers.set('thousand' , 3);
    this.powers.set('million', 6);
    this.powers.set('billion' , 9);
    this.powers.set('trillion' , 12);
    this.powers.set('quadrillion' , 15);
}


Numtext.prototype.getText = function (number){
	/*
	  Returns the English text representation of a number given in numeric 
	  form
	*/

    if (this.numbers.indexOf(parseInt(number)) != -1){
    	return this.textValues[this.numbers.indexOf(parseInt(number))];
    }
    else{
    	if(number.length < 3){
    		var first = parseInt(number[0]) * 10;
    		var second = number[1];
    		return this.getText(first.toString()) + "-" + this.getText(second);

    	}
    	else if(number.length == 3){
    		return this.handleHundreds(number);
    	}
    	else{
    		return this.handleBiggerDenoms(number);
    	}
    }
};

Numtext.prototype.getNumericValue = function(numWord){
	/*
	 Returns the numerical value of an input given in text format
	*/

	var numValue = 0;

	if(this.textValues.indexOf(numWord) > -1){
		return this.numbers[this.textValues.indexOf(numWord)];
	}
    
    var parts = this.getParts(numWord);

	var i = 0;

	while(i < parts.length){
		var curr = parts[i];

		var temp;

		if((i + 1) < parts.length && this.powers.has(parts[i + 1])){
			var label = parts[i + 1];
            
			temp = this.numbers[this.textValues.indexOf(curr)] 
			    * Math.pow(10,this.powers.get(label));

			if((i + 2) < parts.length){
				if(label == "hundred" && parts[i + 2] == 'and'){
					i += 3;
                    
                    while(i < parts.length && !this.powers.has(parts[i])){

                    	temp += this.numbers[this.textValues.indexOf(parts[i])];

                    	i += 1;
                    }
                    
                    if( i < parts.length){
                    	temp *= Math.pow(10,this.powers.get(parts[i]));
                    }

				}

				else if(this.powers.has(parts[i + 2])){

					temp *= Math.pow(10,this.powers.get(parts[i + 2]));

					i += 2;
				}
				else{

					
					i += 1;
				}
			}
			else{
				i += 1;
			}
		}
		else{
			temp = this.numbers[this.textValues.indexOf(curr)];

			if((i + 2) < parts.length){
				temp += this.numbers[this.textValues.indexOf(parts[i + 1])];
				temp *= Math.pow(10,this.powers.get(parts[i + 2]));

				i += 2;
			}
		}
        
        if((i + 1) < parts.length && parts[i + 1] == 'and'){
			i += 1;
		}

		numValue += temp;

		i += 1;
    }

    return numValue;
}

Numtext.prototype.convert = function(number)
{   
	/* 
	An overloaded method that returns the alternative form of a given number
	in a valid format and which falls within the range offered
	*/

	var equiv;

	if(!isNaN(number)){
		number = parseInt(number);
		if(number > 999000000000000000){
			console.log("Input must be less than 999 quadrillion")
		}
		equiv = this.getText(number.toString());
	}
	else{
		equiv = this.getNumericValue(number);

		if(isNaN(equiv)){
			console.log("Input string could not be coverted.Check your spelling.\n"
				         +"Sample Input:\n'six hundred,sixty five','one hundred and two',\n"
				         +"'five thousand and two','sixty thousand,five hundred and two'\n\n"
				         +"Commas are optional but spacing is a must");
		}
	}

	return equiv;
}

Numtext.prototype.handleHundreds = function(number)
{
	/*
	  Handle text generation for numbers in hundreds denomination
	*/

	var firstDigit = number[0];
	var text = "";

	if(firstDigit != "0"){
		text += this.getText(firstDigit) + " hundred ";
	}

	var rem = parseInt(number) - (parseInt(firstDigit) * 100);

	if(rem != 0){
		if(firstDigit != "0"){
		    text += "and ";
		}

		text += this.getText(rem.toString());
	}

	return text;
}

Numtext.prototype.handleBiggerDenoms = function(number)
{
	/*
	Handles text generation for numbers in the thousands
	and above 
	*/

	if(number.length % 3 != 0){
		var padTo = number.length + ( 3 - (number.length % 3));

		number = this.padDigits(number,padTo);
	}
    
	var maxDigits = number.length;

	var name = this.maxDigitMappings.get(maxDigits);

    var firstThreeDigits = number.substr(0,3);
    var remainingDigits = number.substr(3,number.length);

	var text = this.getText(firstThreeDigits) + " " + name + " ";

	var rem = parseInt(remainingDigits);
 
	if(rem >= 100){
		text += ", ";
	}
	else{
		if(rem != 0){
			text += "and ";
		}
	}

	if(rem != 0){
		text += this.getText(rem.toString());
	}

	return text;
}

Numtext.prototype.getParts = function(numWord)
{
	/*
	  Returns the parts or substrings in a number text form
	  as an array
	*/

	numWord = numWord.replace(/,/g , ' ');

	numWord = numWord.replace(/-/g,' ');
	
	var tempParts = numWord.split(" ");

	var parts = [];
	
	for(var i = 0;i < tempParts.length;i++){
		if(tempParts[i].length != 0){
			parts.push(tempParts[i]);
		}
	}

	var copy = parts;

    parts = [];

    for(var i = 0;i < copy.length;i++){
    	if(parseInt(copy[i])){
    		var subParts = this.getParts(this.getText(copy[i]));

    		for(var j = 0;j < subParts.length;j++){
    			parts.push(subParts[j]);
    		}
    	}
    	else{
    		parts.push(copy[i]);
    	}
    }

	return parts;
}

Numtext.prototype.padDigits = function(number,padTo){
	/*
	 Inserts a given number of zeroes at the front of the string representation of numbers 
	*/
	var temp = "";
    var pad = padTo - number.length;

	for(var i = 1; i <= pad;i++){
		temp += "0";
	}

	return temp + number;
}
