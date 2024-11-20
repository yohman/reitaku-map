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
		// カスタム画像のURLを指定
const customIconUrl = `https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-1.jpg`; // 任意の画像URLに置き換え

// カテゴリから色を取得
const borderColor = getCategoryColor(category);  // getCategoryColor関数を使って色を取得
const borderWidth = '2px';

// カスタムマーカー用のHTML要素を作成
const customMarker = document.createElement('div');
customMarker.style.backgroundImage = `url(${customIconUrl})`;
customMarker.style.width = '40px'; 
customMarker.style.height = '40px'; 
customMarker.style.backgroundSize = 'cover'; 
customMarker.style.borderRadius = '50%'; 
customMarker.style.cursor = 'pointer'; // ポインター表示

// 縁取りを追加
customMarker.style.border = `${borderWidth} solid ${borderColor}`;

// マーカーをマップに追加
const marker = new mapboxgl.Marker({ element: customMarker })
    .setLngLat([parseFloat(lon), parseFloat(lat)])
    .addTo(map);


		// ホバーイベントで左パネルを更新
		marker.getElement().addEventListener('mouseenter', () => {
			document.getElementById('info').innerHTML = `
				<h2>${name}</h2>
				<p>Category: ${category}</p>
				<p>${description}</p>
				<img src="https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-1.jpg"
					style="width:350px;height:350px;object-fit:cover">
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
		case 3: return '#FF33FF';
		default: return '#888888';
	}
}
