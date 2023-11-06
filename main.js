// Define parameters array
let parameters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// This function is only to display math in a user-friendly way, has nothing to do with how the code works
function parseLatex(content) {
	return content.replace(/\~(.*?)\~/g, (_, p1) => {
		return MathJax.tex2svg(p1).innerHTML;
	});
}

// Least common multiple function which checks first for the greatest common divisor and then divides the product of num1 and num2 by the gcd
function lcm(num1, num2) {
	let gcd = 1;
	for (let i = 0; i <= Math.abs(num1); i++) {
		if (num1 % i == 0 && num2 % i == 0) gcd = i;
	}
	return num1 * num2 / gcd;
}

// Displays the matrix at each step
function displayNextMatrix(matrixNum) {
	document.getElementById(`matrixDisplay${matrixNum}`).innerHTML = parseLatex(`~{\\begin{bmatrix}&${parameters[0]}  &${parameters[1]}  &${parameters[2]}  &${parameters[3]} &\\\\&${parameters[4]}  &${parameters[5]}  &${parameters[6]}  &${parameters[7]} &\\\\&${parameters[8]}  &${parameters[9]}  &${parameters[10]}  &${parameters[11]} &\\end{bmatrix}}~`);	
}

// This is where most of the math is done - preparing the eliminations
function setElimination(row1, row2, eqIndex) {
	// Get least common multiple of the terms that we want to eliminate
	let rowlcm = lcm(parameters[row1 * 4 + eqIndex], parameters[row2 * 4 + eqIndex]);
	// Get the amount that the first row needs to be multiplied by
	let firstRowMultiplier = rowlcm / parameters[row1 * 4 + eqIndex];
	// Get the amount that the second row needs to be multiplied by
	let secondRowMultiplier = rowlcm / parameters[row2 * 4 + eqIndex];
	// Multiply every element in the appropriate rows by their row multplier. Note that even though there will be zeroes, we multiply everything anyway since the code is actually simpler this way and it doesn't matter if excessive work is done
	for (let i = row1 * 4; i < row1 * 4 + 4; i++) parameters[i] *= firstRowMultiplier;
	for (let i = row2 * 4; i < row2 * 4 + 4; i++) parameters[i] *= secondRowMultiplier;
}

// Simplifies the matrix after the heavy lifting is done and all variables are isolated
function simplifyRow(index1, index2) {
	// Get the greatest common divisor of the two nonzero terms
	let rowgcd = parameters[index1] * parameters[index2] / lcm(parameters[index1], parameters[index2]);
	
	// Divide each parameter by the gcd to simplify
	parameters[index1] /= rowgcd;
	parameters[index2] /= rowgcd;
	
	// Multiply by -1 if needed to get the coefficient equal to a psitive integer
	if (parameters[index1] < 0) {
		parameters[index1] *= -1;
		parameters[index2] *= -1;
	}
}

// Main body code, although most of it is calling functions
function calculate() {	
	// Display all the needed elements
	[...document.getElementsByClassName("toggle")].forEach(e => e.style.display = "initial");
	
	// Stores what variables needed to be eliminated in which order. This is extremely hard to explain so I'll elaborate if needed but there's not going to be an explanation here
	let eliminations = [[0, 1, 0], [0, 2, 0], [1, 2, 1], [1, 2, 2], [0, 1, 1], [0, 2, 2]];
	// Stores parameters for the actual elimination, again this is manually implemented to have the variables eliminate in the correct order. Hard to explain here
	let loopParameters = [[4, -4], [8, -8], [8, -4], [4, 4], [0, 4], [0, 8]];
	
	// Loops through the six eliminations, setting them up appropriately and then subtracting while displaying them after every change
	for (let i = 0; i < 6; i++) {
		displayNextMatrix(i * 2 + 1, parameters);
		setElimination(eliminations[i][0], eliminations[i][1], eliminations[i][2]);
		displayNextMatrix(i * 2 + 2, parameters);
		for (let j = loopParameters[i][0]; j < loopParameters[i][0] + 4; j++) parameters[j] -= parameters[j + loopParameters[i][1]];
	}

	// Display the matrix one more time since it wasn't displayed after the last elimination
	displayNextMatrix(13, parameters);
	
	// Simplify each row by dividing by gcd after eliminating is done
	simplifyRow(0, 3);
	simplifyRow(5, 7);
	simplifyRow(10, 11);
	
	// Display matrix for the last time
	displayNextMatrix(14, parameters);
	
	// Get the x, y, and z coordinates
	let xCoord = (parameters[3] % parameters[0] == 0) ? parseLatex(`~{${parameters[3] / parameters[0]}}~`) : parseLatex(`~\\frac{${parameters[3]}}{${parameters[0]}}~`);
	let yCoord = (parameters[7] % parameters[5] == 0) ? parseLatex(`~{${parameters[7] / parameters[5]}}~`) : parseLatex(`~\\frac{${parameters[7]}}{${parameters[5]}}~`);
	let zCoord = (parameters[11] % parameters[10] == 0) ? parseLatex(`~{${parameters[11] / parameters[10]}}~`) : parseLatex(`~\\frac{${parameters[11]}}{${parameters[10]}}~`);
	
	// Displays the x, y, and z values - first as equations and then as a coordinate triple
	document.getElementById("line1").innerHTML = parseLatex(`~x = ~`) + ' ' + xCoord;
	document.getElementById("line2").innerHTML = parseLatex(`~y = ~`) + ' ' + yCoord;
	document.getElementById("line3").innerHTML = parseLatex(`~z = ~`) + ' ' + zCoord;
	document.getElementById("line4").innerHTML = parseLatex(`~(~`) + xCoord + parseLatex(`~, ~`) + yCoord + parseLatex(`~, ~`) + zCoord + parseLatex(`~).~`);
}

// Checks if the planes are parallel
function checkParallelPlanes(A1, B1, A2, B2) {
	if (A1 / A2 != B1 / B2) return true;
	return false;
}

// This is the function that immediately gets called when the submit button is pressed
function checkIntersection() {
	// Get parameters from input boxes
	for (let i = 0; i < 12; i++) {
		if (document.getElementById(`i${i}`)) parameters[i] = Number(document.getElementById(`i${i}`).value);
	}
	
	// First assumes the matrix is solvable
	let solvable = true;
	
	// Again, this array is manually implemented where each quadruple checks one pair of coefficients for one pair of equations for nine total (3C2 squared = 9)
	let matchingIndices = [[5, 6, 9, 10], [4, 6, 8, 10], [4, 5, 8, 9], [1, 2, 9, 10], [0, 2, 8, 10], [0, 1, 8, 9], [1, 2, 5, 6], [0, 2, 4, 6], [0, 1, 4, 5]];
	
	// Loops through the equations to check for potential matching coefficient ratios. As soon as one is found, an elimination would result in two variables being eliminated at once, either giving an ambuguous case (infinite solutions) or an impossible case (zero solutions)
	for (let i = 0; i < 9; i++) {
		solvable = checkParallelPlanes(parameters[matchingIndices[i][0]], parameters[matchingIndices[i][1]], parameters[matchingIndices[i][2]], parameters[matchingIndices[i][3]]);	
	}
	
	// If none of the coefficient pairs have matching ratios, proceed to the matrix manipulation
	if (solvable) calculate();
	else document.getElementById("existence").innerHTML = "The system does not intersect at a point.";
}
