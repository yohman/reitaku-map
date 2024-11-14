// -------------------------------------------- //
// Googleシートへのアクセス                      //
// -------------------------------------------- //

const sheetNames = ['main'];
const spreadsheetId = '1AZgfYRfWLtVXH7rx7BeEPmbmdy7EfnGDbAwi6bMSNsU';
const apiKey = 'AIzaSyAj_tQf-bp0v3j6Pl8S7HQVO5I-D5WI0GQ';
let data = {};

async function fetchData(sheetName) {
	console.log('Fetching data from', sheetName);
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		const data = await response.json();
		// 最初の行を削除
		data.values.shift();
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return null;
	}
}

// -------------------------------------------- //
// データがすべてのシートから取得されたか確認する関数 //
// -------------------------------------------- //
async function checkAndInit() {
	const promises = sheetNames.map(sheetName => fetchData(sheetName));
	const results = await Promise.all(promises);

	// データがすべてのシートから取得されたか確認
	const allDataFetched = results.every(result => result !== null);

	if (allDataFetched) {
		// データをオブジェクトに格納
		results.forEach((result, index) => {
			data[sheetNames[index]] = result;
		});
		console.log('Data object:', data);

		// 各ページにあるinit関数を実行
		init();
		// Googleシートのデータが読み込まれた後
		document.dispatchEvent(new Event('dataLoaded'));
	} else {
		console.log('一部またはすべてのシートからデータを取得できませんでした。');
	}
}

// -------------------------------------------- //
// さあ始めましょう                              //
// -------------------------------------------- //
checkAndInit();

// -------------------------------------------- //
// マップスクリプトの開始                        //
// -------------------------------------------- //
function init() {

	// Mapboxのアクセストークン
	mapboxgl.accessToken = 'pk.eyJ1IjoieW9oamFwYW4iLCJhIjoiY2xnYnRoOGVmMDFsbTNtbzR0eXV6a2IwZCJ9.kJYURwlqIx_cpXvi66N0uw';

	// データを取得
	const rows = data.main.values;
	
	// すべてのマーカーの平均緯度と経度を計算
	let latSum = 0;
	let lonSum = 0;
	rows.forEach(row => {
		const [id,category, name, englishName, lat, lon,description] = row;
		latSum += parseFloat(lat);
		lonSum += parseFloat(lon);
	});
	const centerlat = latSum / rows.length;
	const centerlon = lonSum / rows.length;
	
	// Mapboxマップを初期化
	const map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: [centerlon,centerlat], // マーカーの平均緯度と経度
		zoom: 15
	});

	// ループでマーカーを追加
	rows.forEach(row => {
		const [id,category, name, englishName, lat, lon,description] = row;
		console.log('row', row);
		const markerColor = getCategoryColor(category);

		// データに基づいてマーカーを追加
		const marker = new mapboxgl.Marker({ color: markerColor })
			.setLngLat([parseFloat(lon), parseFloat(lat)])
			.addTo(map);

		// ホバーイベントで左パネルを更新
		marker.getElement().addEventListener('mouseenter', () => {
			document.getElementById('info').innerHTML = `
				<h2>${name}</h2>
				<p>Category: ${category}</p>
				<p>${description}</p>
			`;
		});

		// ホバーイベントで左パネルを更新
		marker.getElement().addEventListener('mouseleave', () => {
			document.getElementById('info').innerHTML = 'マーカーにホバーして詳細を表示';
		});
	});
}

// カテゴリごとに色を取得するヘルパー関数
function getCategoryColor(category) {
	switch (category) {
		case 0: return '#FF5733';
		case 1: return '#33FF57';
		case 2: return '#3357FF';
		case 3: return '#3357FF';
		default: return '#888888';
	}
}
