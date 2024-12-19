function init() {
    
    // ...existing code...
    let slideIndex = 1;
    showSlides(slideIndex);

    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("mySlides");
        if (slides.length === 0) return; // スライドが存在しない場合は処理をスキップ
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        slides[slideIndex-1].style.display = "block";  
    }

    setInterval(() => {
        plusSlides(1);
    }, 3000); // 3秒ごとにスライドを変更
    // ...existing code...
    
    
    // Mapboxのアクセストークン
    mapboxgl.accessToken = 'pk.eyJ1IjoieW9oamFwYW4iLCJhIjoiY2xnYnRoOGVmMDFsbTNtbzR0eXV6a2IwZCJ9.kJYURwlqIx_cpXvi66N0uw';

    // データを取得
    const rows = data.main.values;

    // すべてのマーカーの平均緯度と経度を計算
    let latSum = 0;
    let lonSum = 0;
    // lat,lonがある行のみを対象にする
    rows.forEach(row => {
        
        const [id, category, name, englishName, lat, lon, japaneseDescription, englishDescription, link, hashutagu, linkname,numphotos] = row;
        if (!lat || !lon) return;
        if (lat && lon) { // lat, lonが存在する場合のみ加算
            latSum += parseFloat(lat);
            lonSum += parseFloat(lon);
        }
    });

    // 中心座標を計算
    const centerlat = latSum / rows.length;
    const centerlon = lonSum / rows.length;

    console.log(centerlat, centerlon);
    // Mapboxマップを初期化
    const map = new mapboxgl.Map({
        container: 'map',
        center: [centerlon, centerlat],
        //style: 'mapbox://styles/mapbox/satellite-v9',
         style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 15
    });
    document.getElementById('normal-map-btn').addEventListener('click', function() {
        map.setStyle('mapbox://styles/mapbox/streets-v11');
      });

      document.getElementById('satellite-map-btn').addEventListener('click', function() {
        map.setStyle('mapbox://styles/mapbox/satellite-v9');
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
        const element = document.getElementById('info');

        // 要素の位置を少し下げる
        element.style.marginTop = '20px';  // 20px 下げる

    // マーカーをマップに追加
    let lastClickedMarker = null; // 最後にクリックしたマーカーを追跡

    rows.forEach(row => {
        const [id, category, jName, eName, lat, lon, jDescription, eDescription,link,hashutagu,linkname,numphotos] = row;
        
        var rphotos = ''; // Object to store dynamically created variables

		for (let i = 1; i <= numphotos; i++) {
			rphotos+=`<div class="mySlides fade"><img src="https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-${i}.jpg" style="width:350px;height:350px;object-fit:cover"></div> `;
		}

        // console.log(rphotos);
        // カスタムマーカー用のHTML要素を作成
        const customMarker = document.createElement('div');
        if (id >= 104 && id <= 112) {
            customMarker.style.backgroundImage = `url(https://chomu0831.github.io/reitaku-photos/images/reitaku-ex.jpg)`;
        } 
        else {
            customMarker.style.backgroundImage = `url(https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-1.jpg)`;
        }
        // customMarker.style.backgroundImage = `url(https://chomu0831.github.io/reitaku-photos/images/reitaku-${id}-1.jpg)`;
        customMarker.style.width = '40px';
        customMarker.style.height = '40px';
        customMarker.style.backgroundSize = 'cover';
        customMarker.style.borderRadius = '50%';
        customMarker.style.cursor = 'pointer';
        customMarker.style.border = `2px solid ${getCategoryColor(category)}`;
        customMarker.style.border = `0 0 0 2px white, 0 0 0 4px ${getCategoryColor(category)}`;

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
                const description = currentLanguage === 'japanese' ? jDescription : eDescription;
                const name = currentLanguage === 'japanese' ? jName : eName;
                document.getElementById('info').innerHTML = `
                    <h2>${name}</h2>
                    <p>${description}</p>
                    <div class="slideshow-container">
                        ${rphotos}
                        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                        <a class="next" onclick="plusSlides(1)">&#10095;</a>
                     </div>
                    <a href="${link}" target="_blank">${linkname}</a>
                    <a href="${hashutagu}">${hashutagu}</a>
                `;
                lastClickedMarker = marker;
            }
        });
    });
}

// カテゴリごとに色を取得するヘルパー関数
function getCategoryColor(category) {
    switch (parseInt(category)) {
        case 0: return '#FFFF33'; // 黄色系
        case 1: return '#33FF57'; // 緑系
        case 2: return '#3357FF'; // 青系
        case 3: return '#FF33FF'; // ピンク系
        case 4: return '#FF5733'; // オレンジ系
        case 5: return '#33FFFF'; // シアン系
        default: return '#ffffff'; // 白系
    }
}
