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

	// numbers whose text forms are fundamental in number to text conversion
	// they are 0 - 20 and then 30 , 40 , 50 ... 90
	this.numbers = [];

	for(var i = 0;i <= 20;i++){
		this.numbers.push(i);
	}

	for(var i = 30;i <= 90;i += 10){
		this.numbers.push(i);
	}

	// corresponding word forms for the numbers
    this.textValues = ["zero" , "one" , "two" ,"three" , "four" ,"five" ,"six" ,"seven",
          "eight" ,"nine" ,"ten","eleven", "twelve", "thirteen", "fourteen",
          "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
          "thirty", "fourty", "fifty", "sixty", "seventy", "eighty", "ninety" ];

    
    // a mapping of the maximum spaces occupied by numbers  from thousand    
    // onwards and the corresponding label applied to their first three digits
    this.maxDigitMappings = new Map();

    this.maxDigitMappings.set(6 , 'thousand');
    this.maxDigitMappings.set(9 , 'million');
    this.maxDigitMappings.set(12 , 'billion');
    this.maxDigitMappings.set(15, 'trillion');
    this.maxDigitMappings.set(18 , 'quadrillion');

    // a mapping of denominations to the corresponding powers of 10
    // that their first three digits are multiplied by
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
    	// if we have the number in our list of fundamental numbers,
        // we simply return its equivalent text form
    	return this.textValues[this.numbers.indexOf(parseInt(number))];
    }
    else{
    	if(number.length < 3){
    		// two digit numbers that are not in our fundamental list
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

	// An accumulator for the numerical value
	var numValue = 0;

	if(this.textValues.indexOf(numWord) > -1){
		// If the given text form exists in our list of fundamental
		// number text forms,we simply return the corresponding
		// numerical value
		return this.numbers[this.textValues.indexOf(numWord)];
	}
    
    // An array of the words in the text form of a number
    var parts = this.getParts(numWord);

    // A control variable for looping through the parts array
	var i = 0;

	while(i < parts.length){
		// hold on to the current element 
		var curr = parts[i];

		// Stores the numerical value of a complete 
		// subunit of the supplied text
		// Examples of complete subunits are 'sixty' , 
		// 'one hundred and two thousand' , 'six'
		var temp;

		if((i + 1) < parts.length && this.powers.has(parts[i + 1])){
			// If the next item is a label eg. 'thousand'

			// Get that label
			var label = parts[i + 1];
            
            // Get the corresponding power of 10 and initialise
            // temp to the value obtained by multiplying the numeric
            // value of the current item by 10 raised to that power
			temp = this.numbers[this.textValues.indexOf(curr)] 
			    * Math.pow(10,this.powers.get(label));

			if((i + 2) < parts.length){
				// If there are at least two more items when at current position
				if(label == "hundred" && parts[i + 2] == 'and'){
					// If the item at one place from the current position is a
					// 'hundred' followed by an 'and'.
					// we move the index variable to the postion after the 'and'
					i += 3;
                    
                    while(i < parts.length && !this.powers.has(parts[i])){
                    	// We try to get all text forms after the 'and' 
                    	// until we either come across a label or the end of the 
                    	// list

                    	// Building up the subunits linked by the 'and' so that
                    	// a label can be applied to them
                    	temp += this.numbers[this.textValues.indexOf(parts[i])];

                        // We move the index since we are continuing our iteration
                    	i += 1;
                    }
                    
                    if( i < parts.length){
                    	// If we terminated from the previous while loop due to
                    	// coming across a label , we do a multiplication on the 
                    	// value accumulated in temp so far using the appropriate
                    	// power of 10 specified by the label
                    	temp *= Math.pow(10,this.powers.get(parts[i]));
                    }

				}

				else if(this.powers.has(parts[i + 2])){
					// Else if the item at two places from the current position is
					// also a label

					// We do further multiplication
					temp *= Math.pow(10,this.powers.get(parts[i + 2]));

					// We have handled two items in advance, we move the index to
					// reflect that
					i += 2;
				}
				else{
					// The item at two positions from current item is not dependent
					// on the current item so temp remains as it is
					// However,we increment the index variable to reflect the fact 
					// that we handled one item in advance 
					
					i += 1;
				}
			}
			else{
				// There is no item at two positions from here
				// But we still need to move the index to reflect the fact
				// that we handled an item in advance 
				i += 1;
			}
		}
		else{
			// Initialise temp with the numeric value of current item
			temp = this.numbers[this.textValues.indexOf(curr)];

			if((i + 2) < parts.length){
				// Since the condition in the outermost if failed,we know
				// that the next item is also a number text
				// 
				// But here, we go further to check whether there is an 
				// item two positions from the current position and whether
				// that item is a label so we do a multiplication
				temp += this.numbers[this.textValues.indexOf(parts[i + 1])];
				temp *= Math.pow(10,this.powers.get(parts[i + 2]));

				// we have handled two items in advance
				i += 2;
			}

			// else we have a number text that is independent of the 
			// next item so temp remains as it is

		}
        
        // If after all the checks and processing above, the next item is an
        // 'and' , we know that this 'and' is not linking subunits but is just 
        // a separator , so we skip it
        if((i + 1) < parts.length && parts[i + 1] == 'and'){
			i += 1;
		}

        // We accumulate the final values of temp for each iteration
		numValue += temp;

        // Move to next item after all the skipped and processed items
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

	// Check if the number is not occupying the maximum digits 
	// space for its denomination
	if(number.length % 3 != 0){
		// If this is the case , we append a pad of zeroes to
		// the beginning of the number string to achieve that
		var padTo = number.length + ( 3 - (number.length % 3));

		number = this.padDigits(number,padTo);
	}
    
    // Maximum digits that numbers in this denomination can have
    // This is equal to the length of the number string after the
    // padding.
	var maxDigits = number.length;

	// Get the corresponding highest label for numbers occupying that
	// amount of spaces. eg. A 6 digit maximum space gives a thousand  
	// as the highest label
	var name = this.maxDigitMappings.get(maxDigits);

    // Get the first three digits of the number.This is the portion
    // whose text form bears the highest denomination label
    // eg the '055' in '055000' bears the 'thousand' 
    var firstThreeDigits = number.substr(0,3);

    // Get the remaining digits
    var remainingDigits = number.substr(3,number.length);

    // We start building the text form of the number
	var text = this.getText(firstThreeDigits) + " " + name + " ";

    // Numerical value of the remaining digits
	var rem = parseInt(remainingDigits);
 
	if(rem >= 100){
		// We need a comma as a separator if we are going to append the 
        // text form of a number greater than 99
		text += ", ";
	}
	else{
		if(rem != 0){
			// We append an 'and' if only we anticipate that the
			// remaining digit whose text form we are going to 
			// append is not a 0
			text += "and ";
		}
	}

	if(rem != 0){
		// If the rem is not a 0 , then it makes sense to append its text form
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

	// Remove all commas in the text
	numWord = numWord.replace(/,/g , ' ');

	// Remove all hyphens
	numWord = numWord.replace(/-/g,' ');
	
	// Split the text in parts based on spacing 
	var tempParts = numWord.split(" ");

	var parts = [];
	
	for(var i = 0;i < tempParts.length;i++){
		if(tempParts[i].length != 0){
			// avoiding extraneous spaces
			parts.push(tempParts[i]);
		}
	}

	var copy = parts;

    parts = [];

    for(var i = 0;i < copy.length;i++){
    	if(parseInt(copy[i])){
    		// if a part of the number text was given in numeric form
    		// we convert it to text form and break it into subparts
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
