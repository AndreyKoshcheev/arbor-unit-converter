package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/koshey/service_converter/converter"
)

var translations = map[string]map[string]string{}

func loadTranslations() {
	langs := []string{"ru", "en"}
	for _, lang := range langs {
		data, err := os.ReadFile("i18n/" + lang + ".json")
		if err != nil {
			log.Fatalf("Failed to load i18n/%s.json: %v", lang, err)
		}
		var t map[string]string
		if err := json.Unmarshal(data, &t); err != nil {
			log.Fatalf("Failed to parse i18n/%s.json: %v", lang, err)
		}
		translations[lang] = t
	}
}

func t(lang, key string, args ...interface{}) string {
	m, ok := translations[lang]
	if !ok {
		m = translations["ru"]
	}
	val, ok := m[key]
	if !ok {
		return key
	}
	if len(args) > 0 {
		return fmt.Sprintf(val, args...)
	}
	return val
}

func tOrKey(lang, key string) string {
	if val := t(lang, key); val != key {
		return val
	}
	return key
}

func getLang(r *http.Request) string {
	if l := r.URL.Query().Get("lang"); l == "ru" || l == "en" {
		return l
	}
	if c, err := r.Cookie("lang"); err == nil {
		if c.Value == "ru" || c.Value == "en" {
			return c.Value
		}
	}
	accept := r.Header.Get("Accept-Language")
	if strings.HasPrefix(accept, "ru") {
		return "ru"
	}
	return "ru"
}

func main() {
	loadTranslations()

	mux := http.NewServeMux()
	mux.HandleFunc("/static/", staticHandler)
	mux.HandleFunc("/api/convert", apiConvertHandler)
	mux.HandleFunc("/api/categories", apiCategoriesHandler)
	mux.HandleFunc("/lang/", langSwitchHandler)
	mux.HandleFunc("/privacy", privacyHandler)
	mux.HandleFunc("/calculator", calculatorHandler)
	mux.HandleFunc("/engineering", engineeringHandler)
	mux.HandleFunc("/credit", creditHandler)
	mux.HandleFunc("/compound", compoundHandler)
	mux.HandleFunc("/", pageHandler)

	fmt.Println("Сервер запущен: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func langSwitchHandler(w http.ResponseWriter, r *http.Request) {
	lang := strings.TrimPrefix(r.URL.Path, "/lang/")
	if lang != "ru" && lang != "en" {
		lang = "ru"
	}
	http.SetCookie(w, &http.Cookie{
		Name:   "lang",
		Value:  lang,
		Path:   "/",
		MaxAge: 86400 * 365,
	})
	ref := r.Referer()
	if ref == "" {
		ref = "/"
	}
	http.Redirect(w, r, ref, http.StatusFound)
}

func staticHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	http.ServeFile(w, r, "."+r.URL.Path)
}

func apiCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	lang := getLang(r)
	w.Header().Set("Content-Type", "application/json")
	cats := converter.GetCategories()
	type respUnit struct {
		Code string `json:"code"`
		Name string `json:"name"`
	}
	type respCat struct {
		Code  string     `json:"code"`
		Name  string     `json:"name"`
		Icon  string     `json:"icon"`
		Units []respUnit `json:"units"`
	}
	var result []respCat
	for _, c := range cats {
		rc := respCat{Code: c.Code, Icon: c.Icon, Name: tOrKey(lang, "nav."+c.Code)}
		for _, u := range c.Units {
			rc.Units = append(rc.Units, respUnit{
				Code: u.Code,
				Name: tOrKey(lang, "unit."+u.Code),
			})
		}
		result = append(result, rc)
	}
	json.NewEncoder(w).Encode(result)
}

func apiConvertHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	category := r.URL.Query().Get("category")
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	valStr := r.URL.Query().Get("value")

	value, err := strconv.ParseFloat(valStr, 64)
	if err != nil || category == "" || from == "" || to == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid params"})
		return
	}

	result := converter.Convert(category, from, to, value)
	if math.IsInf(result, 0) || math.IsNaN(result) {
		result = 0
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"value":  value,
		"from":   from,
		"to":     to,
		"result": math.Round(result*1000000) / 1000000,
	})
}

func privacyHandler(w http.ResponseWriter, r *http.Request) {
	lang := getLang(r)
	funcMap := template.FuncMap{
		"t": func(key string, args ...interface{}) string { return t(lang, key, args...) },
	}
	tmpl := template.Must(template.New("privacy.html").Funcs(funcMap).ParseFiles("templates/privacy.html"))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	err := tmpl.Execute(w, map[string]interface{}{
		"Lang": lang,
		"Title": t(lang, "footer.privacy") + " — " + t(lang, "site.title"),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func calculatorHandler(w http.ResponseWriter, r *http.Request) {
	lang := getLang(r)
	funcMap := template.FuncMap{
		"t": func(key string, args ...interface{}) string { return t(lang, key, args...) },
		"to": func(key string) string { return tOrKey(lang, key) },
	}
	tmpl := template.Must(template.New("calculator.html").Funcs(funcMap).ParseFiles("templates/calculator.html"))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	err := tmpl.Execute(w, map[string]interface{}{
		"Lang": lang,
		"Title": t(lang, "nav.calculator") + " — " + t(lang, "site.title"),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func engineeringHandler(w http.ResponseWriter, r *http.Request) {
	lang := getLang(r)
	funcMap := template.FuncMap{
		"t": func(key string, args ...interface{}) string { return t(lang, key, args...) },
		"to": func(key string) string { return tOrKey(lang, key) },
	}
	tmpl := template.Must(template.New("engineering.html").Funcs(funcMap).ParseFiles("templates/engineering.html"))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	err := tmpl.Execute(w, map[string]interface{}{
		"Lang": lang,
		"Title": t(lang, "nav.engineering") + " — " + t(lang, "site.title"),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func creditHandler(w http.ResponseWriter, r *http.Request) {
	lang := getLang(r)
	funcMap := template.FuncMap{
		"t": func(key string, args ...interface{}) string { return t(lang, key, args...) },
	}
	tmpl := template.Must(template.New("credit.html").Funcs(funcMap).ParseFiles("templates/credit.html"))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	err := tmpl.Execute(w, map[string]interface{}{
		"Lang": lang,
		"Title": t(lang, "nav.credit") + " — " + t(lang, "site.title"),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func compoundHandler(w http.ResponseWriter, r *http.Request) {
	lang := getLang(r)
	funcMap := template.FuncMap{
		"t": func(key string, args ...interface{}) string { return t(lang, key, args...) },
	}
	tmpl := template.Must(template.New("compound.html").Funcs(funcMap).ParseFiles("templates/compound.html"))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	err := tmpl.Execute(w, map[string]interface{}{
		"Lang": lang,
		"Title": t(lang, "nav.compound") + " — " + t(lang, "site.title"),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// Template data
type pageData struct {
	Description   string
	Lang          string
	Title         string
	Slug          string
	Categories    []converter.Category
	CurrentCat    *converter.Category
	DefaultToName string
	IsHome        bool
	T             func(key string, args ...interface{}) string
	TO            func(key string) string
	TGen          func(key string) string // genitive form
}

func pageHandler(w http.ResponseWriter, r *http.Request) {
	lang := getLang(r)
	path := strings.Trim(r.URL.Path, "/")

	// Homepage
	if path == "" {
		cats := converter.GetCategories()
		funcMap := template.FuncMap{
			"t": func(key string, args ...interface{}) string { return t(lang, key, args...) },
			"to": func(key string) string { return tOrKey(lang, key) },
		}
		tmpl := template.Must(template.New("home.html").Funcs(funcMap).ParseFiles("templates/home.html"))
		data := pageData{
			Lang:       lang,
			Title:      t(lang, "home.title"),
			IsHome:     true,
			Description: t(lang, "home.subtitle"),
			Categories: cats,
			T:          func(key string, args ...interface{}) string { return t(lang, key, args...) },
			TO:         func(key string) string { return tOrKey(lang, key) },
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		tmpl.Execute(w, data)
		return
	}

	// Category page
	slug := path
	cats := converter.GetCategories()
	var currentCat *converter.Category
	for i := range cats {
		if cats[i].Code == slug {
			currentCat = &cats[i]
			break
		}
	}
	if currentCat == nil {
		http.NotFound(w, r)
		return
	}

	defaultToName := tOrKey(lang, "unitgen."+currentCat.Units[1].Code)
	if strings.HasPrefix(defaultToName, "unitgen.") {
		defaultToName = currentCat.Units[1].NameGen
	}

	funcMap := template.FuncMap{
		"t": func(key string, args ...interface{}) string { return t(lang, key, args...) },
		"to": func(key string) string { return tOrKey(lang, key) },
		"tgen": func(key string) string {
			val := tOrKey(lang, "unitgen."+key)
			if strings.HasPrefix(val, "unitgen.") {
				return key
			}
			return val
		},
	}

	tmpl := template.Must(template.New("layout.html").Funcs(funcMap).ParseFiles(
		"templates/layout.html",
		"templates/converter.html",
	))

	catName := tOrKey(lang, "nav."+currentCat.Code)
	data := pageData{
		Lang:          lang,
		Title:         catName + " — " + t(lang, "site.title"),
		Slug:          slug,
		Categories:    cats,
		CurrentCat:    currentCat,
		DefaultToName: defaultToName,
		Description: t(lang, "desc."+currentCat.Code),
		T:            func(key string, args ...interface{}) string { return t(lang, key, args...) },
		TO:           func(key string) string { return tOrKey(lang, key) },
		TGen: func(key string) string {
			val := tOrKey(lang, "unitgen."+key)
			if strings.HasPrefix(val, "unitgen.") {
				return key
			}
			return val
		},
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	tmpl.ExecuteTemplate(w, "layout.html", data)
}
