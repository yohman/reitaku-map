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


		// マーカークリック時の詳細表示・非表示
let lastClickedMarker = null; // 最後にクリックされたマーカーを追跡

rows.forEach(row => {
    const [id, category, name, englishName, lat, lon, description] = row;
    console.log('row', row);
    const markerColor = getCategoryColor(category);

    // カスタム画像のURLを指定
    const customIconUrl = `https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-1.jpg`;

    // カスタムマーカー用のHTML要素を作成
    const customMarker = document.createElement('div');
    customMarker.style.backgroundImage = `url(${customIconUrl})`;
    customMarker.style.width = '40px'; 
    customMarker.style.height = '40px'; 
    customMarker.style.backgroundSize = 'cover'; 
    customMarker.style.borderRadius = '50%'; 
    customMarker.style.cursor = 'pointer'; // ポインター表示
    customMarker.style.border = `2px solid ${getCategoryColor(category)}`;

    // マーカーをマップに追加
    const marker = new mapboxgl.Marker({ element: customMarker })
        .setLngLat([parseFloat(lon), parseFloat(lat)])
        .addTo(map);

    // クリックイベントで左パネルをトグル表示
    marker.getElement().addEventListener('click', () => {
        // 同じマーカーを再度クリックした場合、パネルをクリア
        if (lastClickedMarker === marker) {
            document.getElementById('info').innerHTML = 'マーカーをクリックまたはタップして詳細を表示';
            lastClickedMarker = null; // リセット
        } else {
            // 新しいマーカーがクリックされた場合、詳細を更新
            document.getElementById('info').innerHTML = `
                <h2>${name}</h2>
                <p>Category: ${category}</p>
                <p>${description}</p>
                <img src="https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-1.jpg"
                    style="width:350px;height:350px;object-fit:cover">
            `;
            lastClickedMarker = marker; // 追跡するマーカーを更新
        }
    });
});

// 初期メッセージを設定
document.getElementById('info').innerHTML = 'アイコンをクリックまたはタップして詳細を表示';


	});
}

// カテゴリごとに色を取得するヘルパー関数
function getCategoryColor(category) {
	switch (parseInt(category)) {
		case 0: return '#FF5733'; // 赤系
		case 1: return '#33FF57'; // 緑系
		case 2: return '#3357FF'; // 青系
		case 3: return '#FF33FF'; // ピンク系
		default: return '#888888'; // デフォルト（グレー）
	}
	
}
