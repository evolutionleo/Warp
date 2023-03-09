enum INTERP {
	NONE = 0,
	LINEAR = 1//,
	//QUADRATIC = 2
}

function interpolate(x, x1, y1, x2 = undefined, y2 = undefined, x3 = undefined, y3 = undefined, interp = INTERP.NONE) {
	if is_undefined(x2) or is_undefined(y2) or x2 == x1 or interp == INTERP.NONE
		return y1
	else
		return interpolateLinear(x, x1, y1, x2, y2)
	//else if is_undefined(x3) or is_undefined(y3) or x3 == x2 or interp == INTERP.LINEAR
	//else
	//	return interpolateQuadratic(x, x1, y1, x2, y2, x3, y3)
}

function interpolateLinear(x, x1, y1, x2, y2) {
	return lerp(y1, y2, (x - x1) / (x2 - x1))
}

function interpolateQuadratic(x, x1, y1, x2, y2, x3, y3) {
	x3 -= x1
	x2 -= x1
	x1 -= x1
	
	var a11 = x1*x1, a12 = x1, a13 = 1
	var a21 = x2*x2, a22 = x2, a23 = 1
	var a31 = x3*x3, a32 = x3, a33 = 1
	
	var d = matrixDeterminant(a11, a12, a13, a21, a22, a23, a31, a32, a33)
	var d1 = matrixDeterminant(y1, a12, a13, y2, a22, a23, y3, a32, a33)
	var d2 = matrixDeterminant(a11, y1, a13, a21, y2, a23, a31, y3, a33)
	var d3 = matrixDeterminant(a11, a12, y1, a21, a22, y2, a31, a32, y3)
	
	var a = d1 / d
	var b = d2 / d
	var c = d3 / d
	
	
	var _y = a  *  (x * x) + b  *  x + c
	var _ = 1
	
	//var a = y1 / ((x1 - x2) * (x1 - x3))
	//a += y2  /  ((x2  -  x1) * (x2 - x3))
	//a += y3 / ((x3 - x1) * (x3 - x2))
	
	//var b =	 - y1 * (x2+x3) / ((x1 - x2) * (x1 - x3))
	//b -= y2 * (x1+x3) / ((x2 - x1) * (x2 - x3))
	//b -= y3 * (x1+x2) / ((x3 - x1) * (x3 - x2))
	
	//var c	= y1 * x2 * x3 / ((x1 - x2) * (x1 - x3))
	//c += y2 * x1 * x3 / ((x2 - x1) * (x2 - x3))
	//c += y3 * x1 * x2 / ((x3 - x1) * (x3 - x2))
	
	//var t12 = x1 - x2, t21 = x2 - x1, t13 = x1 - x3, t31 = x3 - x1, t23 = x2 - x3, t32 = x3 - x2
	
	//var a = y1 / (t12 * t13) + y2 / (t21 * t23) + y3 / (t31 * t32)
	//var b = -y1 * (x2 + x3) - y2 * (x1 + x3) / (t21 * t23) - y3 * (x1 + x2) / (t31 * t32)
	//var c = y1 * x2 * x3 / (t12 * t13) + y2 * x1 * x3 / (t21 * t23) + y3 * x1 * x2 / (t31 * t32)
	
	return _y
}

function matrixDeterminant(a11, a12, a13, a21, a22, a23, a31, a32, a33) {
	return a11 * (a22 * a33 - a32 * a23) - a12 * (a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31)
}


function interpolateStruct(t, t1, v1, t2, v2, t3, v3, interp) {
	var result = {}
	var var_names = variable_struct_get_names(v1), l = variable_struct_names_count(v1)
	for(var i = 0; i < l; i++) {
		var var_name = var_names[i]
		var new_v1 = v1[$ var_name]
		var new_v2 = is_undefined(v2) ? undefined : v2[$ var_name]
		var new_v3 = is_undefined(v3) ? undefined : v3[$ var_name]
		
		var new_interp = is_struct(interp) ? interp[$ var_name] : interp
		
		if (is_struct(new_v1))
			var value = interpolateStruct(t, t1, new_v1, t2, new_v2, t3, new_v3, new_interp)
		else
			value = interpolate(t, t1, new_v1, t2, new_v2, t3, new_v3, new_interp)
		
		result[$ var_name] = value
	}
	return result
}