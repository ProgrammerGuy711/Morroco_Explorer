from flask import Flask, jsonify
from flask_cors import CORS
from data import cities

app = Flask(__name__)
CORS(app)


@app.route('/cities', methods=['GET'])
def get_cities():
    return jsonify(list(cities.keys()))


@app.route('/cities/all', methods=['GET'])
def get_all_cities():
    return jsonify(cities)


@app.route('/cities/saharan', methods=['GET'])
def get_saharan():
    saharan = {k: v for k, v in cities.items() if v["saharan"]}
    return jsonify(saharan)


@app.route('/city/<name>', methods=['GET'])
def get_city(name):
    city = cities.get(name.lower())
    if city:
        return jsonify(city)
    return jsonify({"error": f"City '{name}' not found"}), 404


@app.route('/search/<query>', methods=['GET'])
def search_cities(query):
    q = query.lower()
    results = {
        k: v for k, v in cities.items()
        if q in v["name"].lower() or q in v["region"].lower()
    }
    return jsonify(results)


if __name__ == '__main__':
    print("Morocco API running at http://localhost:5000")
    app.run(debug=True)
