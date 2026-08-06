# 🔄 Конвертер величин

Веб-конвертер единиц измерения на Go с поддержкой двух языков.

## 🚀 Быстрый старт

```bash
sudo apt install -y golang-go
cd /home/koshey/project/service_converter
go run .
# → http://localhost:8080
```

## 📦 Сборка бинарника

```bash
go build -ldflags="-s -w" -o converter .
./converter
```

## 🌐 Языки

- 🇷🇺 Русский (по умолчанию)
- 🇬🇧 English

Переключение в хедере или через `?lang=en`.

## 📏 Категории

| Категория | Единицы |
|-----------|---------|
| Длина | метры, сантиметры, дюймы, футы |
| Вес | кг, фунты, унции |
| Температура | Цельсий, Фаренгейт, Кельвин |
| Объём | литры, галлоны, кубометры |
| Скорость | км/ч, мили/ч, узлы |
| Размер данных | байты, КБ, МБ, ГБ |

## 🔌 API

```
GET /api/convert?category=length&from=meter&to=foot&value=10
GET /api/categories?lang=en
```
