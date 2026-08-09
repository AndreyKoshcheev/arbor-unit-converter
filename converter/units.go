package converter

type Unit struct {
	Code    string
	Name    string // именительный (Сантиметры)
	NameGen string // родительный (Сантиметров) — для результатов
	ToBase  float64
}

type Category struct {
	Code          string
	Name          string
	Icon          string
	Units         []Unit
	BaseUnit      string
	IsTemperature bool
	IsAngle       bool
	Description   string
}

func GetCategories() []Category {
	massUnits := []Unit{
		{"ton", "Тонны", "Тонн", 1000},
		{"kilogram", "Килограммы", "Килограммов", 1},
		{"pound", "Фунты", "Фунтов", 0.45359237},
		{"ounce", "Унции", "Унций", 0.0283495},
	}
	lengthUnits := []Unit{
		{"kilometer", "Километры", "Километров", 1000},
		{"meter", "Метры", "Метров", 1},
		{"centimeter", "Сантиметры", "Сантиметров", 0.01},
		{"inch", "Дюймы", "Дюймов", 0.0254},
		{"foot", "Футы", "Футов", 0.3048},
		{"yard", "Ярды", "Ярдов", 0.9144},
		{"mile", "Мили", "Миль", 1609.344},
	}
	tempUnits := []Unit{
		{"celsius", "Цельсий", "Цельсия", 0},
		{"fahrenheit", "Фаренгейт", "Фаренгейта", 0},
		{"kelvin", "Кельвин", "Кельвина", 0},
		{"rankine", "Ранкин", "Ранкина", 0},
	}
	pressureUnits := []Unit{
		{"pascal", "Паскали", "Паскалей", 1},
		{"kgf_sqcm", "Кг/см²", "Кг/см²", 98066.5},
		{"atmosphere", "Атмосферы", "Атмосфер", 101325},
		{"bar", "Бары", "Бар", 100000},
		{"torr", "Торры", "Торр", 133.322},
		{"millibar", "Миллибары", "Миллибар", 100},
	}
	volumeUnits := []Unit{
		{"liter", "Литры", "Литров", 1},
		{"gallon", "Галлоны", "Галлонов", 3.78541},
		{"ounce_volume", "Жидк. унции", "Жидк. унций", 0.0295735},
		{"cubic_meter", "Куб. метры", "Куб. метров", 1000},
	}
	areaUnits := []Unit{
		{"sq_foot", "Кв. футы", "Кв. футов", 0.092903},
		{"sq_mile", "Кв. мили", "Кв. миль", 2589988},
		{"acre", "Акры", "Акров", 4046.86},
		{"are", "Сотки", "Соток", 100},
	}
	densityUnits := []Unit{
		{"gram_per_liter", "Грамм/литр", "Грамм/литр", 1},
		{"kg_per_cubic_cm", "Кг/см³", "Кг/см³", 1000000},
		{"pound_per_cubic_inch", "Фунт/дюйм³", "Фунт/дюйм³", 27679.9},
	}
	timeUnits := []Unit{
		{"day", "Дни", "Дней", 86400},
		{"minute", "Минуты", "Минут", 60},
		{"second", "Секунды", "Секунд", 1},
		{"millisecond", "Миллисекунды", "Миллисекунд", 0.001},
	}
	speedUnits := []Unit{
		{"kmh", "Км/ч", "Км/ч", 1},
		{"ms", "М/с", "М/с", 3.6},
		{"mph", "Мили/ч", "Мили/ч", 1.60934},
		{"knot", "Узлы", "Узлов", 1.852},
	}
	accelUnits := []Unit{
		{"m_per_s2", "М/с²", "М/с²", 1},
		{"km_per_s2", "Км/с²", "Км/с²", 1000},
	}
	forceUnits := []Unit{
		{"newton", "Ньютоны", "Ньютонов", 1},
		{"dyne", "Дины", "Дин", 0.00001},
		{"kgf", "Килограмм-сила", "Килограмм-сила", 9.80665},
		{"gf", "Грамм-сила", "Грамм-сила", 0.00980665},
		{"lbf", "Фунт-сила", "Фунт-сила", 4.44822},
	}
	angleUnits := []Unit{
		{"degree", "Градусы", "Градусов", 0},
		{"radian", "Радианы", "Радианов", 0},
		{"circle", "Окружности", "Окружностей", 0},
	}
	powerUnits := []Unit{
		{"watt", "Ватты", "Ватт", 1},
		{"kilowatt", "Киловатты", "Киловатт", 1000},
		{"horsepower", "Лошадиные силы", "Лош. сил", 735.499},
		{"megawatt", "Мегаватты", "Мегаватт", 1000000},
	}
	energyUnits := []Unit{
		{"calorie", "Калории", "Калорий", 4.184},
		{"joule", "Джоули", "Джоулей", 1},
		{"erg", "Эрги", "Эрг", 0.0000001},
		{"btu", "БТЕ", "БТЕ", 1055.06},
		{"watt_hour", "Ватт·часы", "Ватт·часов", 3600},
	}
	freqUnits := []Unit{
		{"hertz", "Герцы", "Герц", 1},
		{"megahertz", "Мегагерцы", "Мегагерц", 1000000},
		{"rpm", "Об/мин", "Об/мин", 1.0 / 60},
	}
	compUnits := []Unit{
		{"bit", "Биты", "Бит", 1},
		{"byte", "Байты", "Байт", 8},
		{"kilobyte", "Килобайты", "Килобайт", 8 * 1024},
		{"megabit", "Мегабиты", "Мегабит", 125000},
		{"megabyte", "Мегабайты", "Мегабайт", 8 * 1024 * 1024},
		{"gigabyte", "Гигабайты", "Гигабайт", 8 * 1024 * 1024 * 1024},
		{"terabyte", "Терабайты", "Терабайт", 8 * 1024 * 1024 * 1024 * 1024},
	}
	currentUnits := []Unit{
		{"ampere", "Амперы", "Ампер", 1},
		{"milliampere", "Миллиамперы", "Миллиампер", 0.001},
		{"volt_per_ohm", "Вольт/Ом", "Вольт/Ом", 1},
		{"gilbert", "Гильберты", "Гильбертов", 0.795775},
		{"gauss", "Гауссы", "Гаусс", 0.0001},
		{"coulomb_per_sec", "Кулон/с", "Кулон/с", 1},
	}
	emagUnits := []Unit{
		{"farad", "Фарады", "Фарад", 1},
		{"microfarad", "Микрофарады", "Микрофарад", 0.000001},
		{"picofarad", "Пикофарады", "Пикофарад", 0.000000000001},
		{"statfarad", "Статфарады", "Статфарад", 0.00000111265},
	}
	illumUnits := []Unit{
		{"lumen_per_sqm", "Люмен/м²", "Люмен/м²", 1},
		{"lux", "Люксы", "Люкс", 1},
		{"phot", "Фоты", "Фот", 10000},
		{"meter_candle", "Метр-кандела", "Метр-кандела", 1},
	}
	brightUnits := []Unit{
		{"lambert", "Ламберты", "Ламберт", 1},
		{"stilb", "Сантиканделы", "Сантикандел", 0.0001},
		{"candela", "Канделы", "Кандел", 0.0001},
	}

	return []Category{
		{"mass", "Масса", "⚖️", massUnits, "kilogram", false, false, "Тонны, килограммы, фунты, унции и другие единицы массы"},
		{"length", "Длина", "📏", lengthUnits, "meter", false, false, "Километры, метры, футы, ярды, дюймы, мили"},
		{"temperature", "Температура", "🌡️", tempUnits, "celsius", true, false, "Цельсий, Фаренгейт, Кельвин, Ранкин"},
		{"pressure", "Давление", "💨", pressureUnits, "pascal", false, false, "Паскали, бары, атмосферы, торры"},
		{"volume", "Объём", "📐", volumeUnits, "liter", false, false, "Литры, галлоны, куб. метры"},
		{"area", "Площадь", "🔲", areaUnits, "sq_foot", false, false, "Кв. футы, акры, сотки, кв. мили"},
		{"density", "Плотность", "🧱", densityUnits, "gram_per_liter", false, false, "Грамм/литр, кг/см³, фунт/дюйм³"},
		{"time", "Время", "⏱️", timeUnits, "second", false, false, "Дни, минуты, секунды, миллисекунды"},
		{"speed", "Скорость", "🚀", speedUnits, "kmh", false, false, "Км/ч, м/с, мили/ч, узлы"},
		{"acceleration", "Ускорение", "📈", accelUnits, "m_per_s2", false, false, "М/с², км/с²"},
		{"force", "Сила", "💪", forceUnits, "newton", false, false, "Ньютоны, дины, кгс, грамм-сила, фунт-сила"},
		{"angle", "Угол", "📐", angleUnits, "degree", false, true, "Градусы, радианы, окружности"},
		{"power", "Мощность", "⚡", powerUnits, "watt", false, false, "Ватты, киловатты, лошадиные силы"},
		{"energy", "Энергия", "🔥", energyUnits, "joule", false, false, "Джоули, калории, эрги, БТЕ, ватт·часы"},
		{"frequency", "Частота", "📊", freqUnits, "hertz", false, false, "Герцы, мегагерцы, об/мин"},
		{"computing", "Комп. единицы", "💾", compUnits, "bit", false, false, "Биты, байты, кило-, мега-, гига-, терабайты"},
		{"current", "Эл. ток", "⚡", currentUnits, "ampere", false, false, "Амперы, миллиамперы, гильберты, гауссы"},
		{"electromagnetism", "Электромагнетизм", "🧲", emagUnits, "farad", false, false, "Фарады, микро-, пико-, статфарады"},
		{"illuminance", "Освещённость", "💡", illumUnits, "lux", false, false, "Люксы, фоты, люмен/м²"},
		{"brightness", "Яркость", "✨", brightUnits, "candela", false, false, "Ламберты, канделы, стильбы"},
	}
}

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
	}
	switch to {
	case "degree":
		return degrees
	case "radian":
		return degrees * 3.141592653589793 / 180
	case "circle":
		return degrees / 360
	}
	return 0
}
