function init() {
    // Mapboxのアクセストークン
    mapboxgl.accessToken = 'pk.eyJ1IjoieW9oamFwYW4iLCJhIjoiY2xnYnRoOGVmMDFsbTNtbzR0eXV6a2IwZCJ9.kJYURwlqIx_cpXvi66N0uw';

    // データを取得
    const rows = data.main.values;

    // すべてのマーカーの平均緯度と経度を計算
    let latSum = 0;
    let lonSum = 0;
    rows.forEach(row => {
        const [id, category, name, englishName, lat, lon, japaneseDescription, englishDescription] = row;
        latSum += parseFloat(lat);
        lonSum += parseFloat(lon);
    });
    const centerlat = latSum / rows.length;
    const centerlon = lonSum / rows.length;

    // Mapboxマップを初期化
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [centerlon, centerlat],
        zoom: 15
    });

    // 言語切り替え設定
    let currentLanguage = 'japanese'; // 初期言語
    function setLanguage(language) {
        currentLanguage = language;
        if (lastClickedMarker) {
            lastClickedMarker.getElement().click(); // 最後にクリックしたマーカーを再クリックして更新
        }
    }

    // 言語切り替えボタンを動的に追加
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.top = '10px';
    buttonContainer.style.left = '10px';
    buttonContainer.style.zIndex = '1';
    buttonContainer.innerHTML = `
        <button id="japanese-button">日本語</button>
        <button id="english-button">English</button>
    `;
    document.body.appendChild(buttonContainer);

    // ボタンクリックイベントを登録
    document.getElementById('japanese-button').addEventListener('click', () => setLanguage('japanese'));
    document.getElementById('english-button').addEventListener('click', () => setLanguage('english'));

    // 初期メッセージを設定
    document.getElementById('info').innerHTML = '言語の選択とアイコンをクリックまたはタップして詳細を表示';
        // 特定の要素を取得
        const element = document.getElementById('info');

        // 要素の位置を少し下げる
        element.style.marginTop = '20px';  // 20px 下げる

    // マーカーをマップに追加
    let lastClickedMarker = null; // 最後にクリックしたマーカーを追跡

    rows.forEach(row => {
        const [id, category, name, englishName, lat, lon, japaneseDescription, englishDescription] = row;
        const customIconUrl = `https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-1.jpg`;

        // カスタムマーカー用のHTML要素を作成
        const customMarker = document.createElement('div');
        customMarker.style.backgroundImage = `url(${customIconUrl})`;
        customMarker.style.width = '40px';
        customMarker.style.height = '40px';
        customMarker.style.backgroundSize = 'cover';
        customMarker.style.borderRadius = '50%';
        customMarker.style.cursor = 'pointer';
        customMarker.style.border = `2px solid ${getCategoryColor(category)}`;

        // マーカーをマップに追加
        const marker = new mapboxgl.Marker({ element: customMarker })
            .setLngLat([parseFloat(lon), parseFloat(lat)])
            .addTo(map);

        // クリックイベントで左パネルをトグル表示
        marker.getElement().addEventListener('click', () => {
            if (lastClickedMarker === marker) {
                document.getElementById('info').innerHTML = '言語を選択とマーカーをクリックまたはタップして詳細を表示';
                lastClickedMarker = null;
            } else {
                const description = currentLanguage === 'japanese' ? japaneseDescription : englishDescription;
                document.getElementById('info').innerHTML = `
                    <h2>${name}</h2>
                    <p>${description}</p>
                    <img src="${customIconUrl}" style="width:350px;height:350px;object-fit:cover">
                `;
                lastClickedMarker = marker;
            }
        });
    });
}

// カテゴリごとに色を取得するヘルパー関数
function getCategoryColor(category) {
    switch (parseInt(category)) {
        case 0: return '#FF5733'; // 赤系
        case 1: return '#33FF57'; // 緑系
        case 2: return '#3357FF'; // 青系
        case 3: return '#FF33FF'; // ピンク系
        default: return '#888888'; // デフォルト
    }
}
