package converter

func Convert(categoryCode, fromCode, toCode string, value float64) float64 {
	cats := GetCategories()
	var cat *Category
	for i := range cats {
		if cats[i].Code == categoryCode {
			cat = &cats[i]
			break
		}
	}
	if cat == nil {
		return 0
	}

	var fromUnit, toUnit *Unit
	for i := range cat.Units {
		if cat.Units[i].Code == fromCode {
			fromUnit = &cat.Units[i]
		}
		if cat.Units[i].Code == toCode {
			toUnit = &cat.Units[i]
		}
	}
	if fromUnit == nil || toUnit == nil {
		return 0
	}

	if cat.IsTemperature {
		return convertTemperature(value, fromCode, toCode)
	}
	if cat.IsAngle {
		return convertAngle(value, fromCode, toCode)
	}

	return value * (fromUnit.ToBase / toUnit.ToBase)
}

func convertTemperature(value float64, from, to string) float64 {
	var celsius float64
	switch from {
	case "celsius":
		celsius = value
	case "fahrenheit":
		celsius = (value - 32) * 5 / 9
	case "kelvin":
		celsius = value - 273.15
	case "rankine":
		celsius = (value - 491.67) * 5 / 9
	case "reaumur":
		celsius = value * 5 / 4
	}
	switch to {
	case "celsius":
		return celsius
	case "fahrenheit":
		return celsius*9/5 + 32
	case "kelvin":
		return celsius + 273.15
	case "rankine":
		return celsius*9/5 + 491.67
	case "reaumur":
		return celsius * 4 / 5
	}
	return 0
}

func convertAngle(value float64, from, to string) float64 {
	var degrees float64
	switch from {
	case "degree":
		degrees = value
	case "radian":
		degrees = value * 180 / 3.141592653589793
	case "circle":
		degrees = value * 360
	case "full_circle":
		degrees = value * 360
	case "gon":
		degrees = value * 0.9
	case "grad":
		degrees = value * 0.9
	case "quadrant":
		degrees = value * 90
	case "revolution":
		degrees = value * 360
	case "right_angle":
		degrees = value * 90
	case "sextant":
		degrees = value * 60
	case "compass_point":
		degrees = value * 11.25
	case "compass":
		degrees = value * 11.25
	case "arcminute":
		degrees = value / 60
	case "arcsecond":
		degrees = value / 3600
	}
	switch to {
	case "degree":
		return degrees
	case "radian":
		return degrees * 3.141592653589793 / 180
	case "circle":
		return degrees / 360
	case "full_circle":
		return degrees / 360
	case "gon":
		return degrees / 0.9
	case "grad":
		return degrees / 0.9
	case "quadrant":
		return degrees / 90
	case "revolution":
		return degrees / 360
	case "right_angle":
		return degrees / 90
	case "sextant":
		return degrees / 60
	case "compass_point":
		return degrees / 11.25
	case "compass":
		return degrees / 11.25
	case "arcminute":
		return degrees * 60
	case "arcsecond":
		return degrees * 3600
	}
	return 0
}
