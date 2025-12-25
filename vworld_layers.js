/**
 * VWorld WMS 레이어 추가 모듈
 * - 용도지역/지구
 * - 도시계획시설
 * - 사업지구경계도
 * - 토지이용계획도
 */

var VWORLD_WMS_KEY = 'E5B1657B-9B6F-3A4B-91EF-98512BE931A1';

// VWorld WMS 타일 URL 생성 함수
function getVWorldWMSTileUrl(layer, x, y, z) {
    var bbox = tile2bbox(x, y, z);
    return 'https://api.vworld.kr/req/wms?' +
        'SERVICE=WMS&' +
        'REQUEST=GetMap&' +
        'VERSION=1.3.0&' +
        'LAYERS=' + layer + '&' +
        'STYLES=&' +
        'CRS=EPSG:3857&' +
        'BBOX=' + bbox.join(',') + '&' +
        'WIDTH=256&' +
        'HEIGHT=256&' +
        'FORMAT=image/png&' +
        'TRANSPARENT=true&' +
        'BGCOLOR=0xFFFFFF&' +
        'EXCEPTIONS=text/xml&' +
        'KEY=' + VWORLD_WMS_KEY;
}

// 타일 좌표를 BBOX(경계 박스)로 변환
function tile2bbox(x, y, z) {
    var n = Math.pow(2, z);
    var lon_min = (x / n) * 360 - 180;
    var lon_max = ((x + 1) / n) * 360 - 180;

    var lat_rad_min = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    var lat_rad_max = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));

    var lat_min = lat_rad_min * 180 / Math.PI;
    var lat_max = lat_rad_max * 180 / Math.PI;

    // Web Mercator (EPSG:3857) 좌표로 변환
    var merc_x_min = lon_min * 20037508.34 / 180;
    var merc_x_max = lon_max * 20037508.34 / 180;

    var merc_y_min = Math.log(Math.tan((90 + lat_min) * Math.PI / 360)) / (Math.PI / 180);
    merc_y_min = merc_y_min * 20037508.34 / 180;

    var merc_y_max = Math.log(Math.tan((90 + lat_max) * Math.PI / 360)) / (Math.PI / 180);
    merc_y_max = merc_y_max * 20037508.34 / 180;

    return [merc_x_min, merc_y_min, merc_x_max, merc_y_max];
}

// VWorld WMS 레이어 정의
var vworldLayers = {
    // 용도지역/지구
    'lt_c_uq111': '제1종전용주거지역',
    'lt_c_uq112': '제2종전용주거지역',
    'lt_c_uq121': '제1종일반주거지역',
    'lt_c_uq122': '제2종일반주거지역',
    'lt_c_uq123': '제3종일반주거지역',
    'lt_c_uq131': '준주거지역',
    'lt_c_uq141': '중심상업지역',
    'lt_c_uq142': '일반상업지역',
    'lt_c_uq143': '근린상업지역',
    'lt_c_uq144': '유통상업지역',
    'lt_c_uq151': '전용공업지역',
    'lt_c_uq152': '일반공업지역',
    'lt_c_uq153': '준공업지역',
    'lt_c_uq161': '보전녹지지역',
    'lt_c_uq162': '생산녹지지역',
    'lt_c_uq163': '자연녹지지역',
    'lt_c_uq171': '보전관리지역',
    'lt_c_uq172': '생산관리지역',
    'lt_c_uq173': '계획관리지역',
    'lt_c_uq181': '농림지역',
    'lt_c_uq182': '자연환경보전지역',

    // 용도지구
    'lt_c_uq211': '경관지구',
    'lt_c_uq212': '고도지구',
    'lt_c_uq213': '방화지구',
    'lt_c_uq214': '방재지구',
    'lt_c_uq215': '보호지구',
    'lt_c_uq216': '취락지구',
    'lt_c_uq217': '개발진흥지구',
    'lt_c_uq218': '특정용도제한지구',
    'lt_c_uq219': '복합용도지구',

    // 개발제한구역
    'lt_c_uq311': '개발제한구역',

    // 도시계획시설
    'lp_pa_cbnd_bonbun': '토지(임야)대장경계',
    'lp_pa_cbnd_bubun': '토지이용계획',
    'lt_c_upisuq151': '도시계획시설_도로',
    'lt_c_upisuq152': '도시계획시설_철도',
    'lt_c_upisuq153': '도시계획시설_항만',
    'lt_c_upisuq154': '도시계획시설_공항',
    'lt_c_upisuq155': '도시계획시설_주차장',

    // 사업지구
    'lh_neoplx': '택지개발지구',
    'lt_c_aisresc': '산업단지',
};

// 활성화된 레이어 추적
var activeVWorldLayers = {};

// VWorld 레이어 초기화 (카카오맵 로드 후 호출)
function initVWorldLayers() {
    console.log('🌍 VWorld WMS 레이어 초기화...');

    // 각 레이어별 Tileset 등록
    for (var layerId in vworldLayers) {
        (function(lid) {
            kakao.maps.Tileset.add('VWORLD_' + lid, new kakao.maps.Tileset({
                width: 256,
                height: 256,
                getTile: function(x, y, z) {
                    var div = document.createElement('div');
                    div.style.width = '256px';
                    div.style.height = '256px';
                    div.style.backgroundImage = 'url(' + getVWorldWMSTileUrl(lid, x, y, z) + ')';
                    div.style.backgroundSize = 'cover';
                    return div;
                }
            }));
            console.log('  ✅ ' + vworldLayers[lid] + ' (' + lid + ') 등록 완료');
        })(layerId);
    }

    console.log('🎉 VWorld 레이어 초기화 완료!');
}

// 레이어 토글 함수
function toggleVWorldLayer(layerId) {
    var mapTypeId = kakao.maps.MapTypeId['VWORLD_' + layerId];

    if (activeVWorldLayers[layerId]) {
        // 레이어 끄기
        map.removeOverlayMapTypeId(mapTypeId);
        activeVWorldLayers[layerId] = false;
        console.log('❌ ' + vworldLayers[layerId] + ' 레이어 OFF');
    } else {
        // 레이어 켜기
        map.addOverlayMapTypeId(mapTypeId);
        activeVWorldLayers[layerId] = true;
        console.log('✅ ' + vworldLayers[layerId] + ' 레이어 ON');
    }
}

// 주요 레이어 그룹별 토글 함수
function toggleZoningLayer() {
    // 용도지역 통합 표시 (녹지지역, 주거지역, 상업지역, 공업지역)
    var zoningLayers = [
        'lt_c_uq161', // 보전녹지
        'lt_c_uq162', // 생산녹지
        'lt_c_uq163', // 자연녹지
        'lt_c_uq121', // 제1종일반주거
        'lt_c_uq122', // 제2종일반주거
        'lt_c_uq123', // 제3종일반주거
        'lt_c_uq141', // 중심상업
        'lt_c_uq142', // 일반상업
        'lt_c_uq143', // 근린상업
        'lt_c_uq151', // 전용공업
        'lt_c_uq152', // 일반공업
        'lt_c_uq153'  // 준공업
    ];

    var isActive = activeVWorldLayers['zoning_group'];

    zoningLayers.forEach(function(lid) {
        var mapTypeId = kakao.maps.MapTypeId['VWORLD_' + lid];
        if (isActive) {
            map.removeOverlayMapTypeId(mapTypeId);
        } else {
            map.addOverlayMapTypeId(mapTypeId);
        }
    });

    activeVWorldLayers['zoning_group'] = !isActive;
    console.log((isActive ? '❌' : '✅') + ' 용도지역 레이어 ' + (isActive ? 'OFF' : 'ON'));
}

function toggleUrbanPlanLayer() {
    // 도시계획시설 (도로, 철도 등)
    var urbanLayers = [
        'lt_c_upisuq151', // 도로
        'lt_c_upisuq152', // 철도
        'lt_c_upisuq153', // 항만
        'lt_c_upisuq154', // 공항
        'lt_c_upisuq155'  // 주차장
    ];

    var isActive = activeVWorldLayers['urban_plan_group'];

    urbanLayers.forEach(function(lid) {
        var mapTypeId = kakao.maps.MapTypeId['VWORLD_' + lid];
        if (isActive) {
            map.removeOverlayMapTypeId(mapTypeId);
        } else {
            map.addOverlayMapTypeId(mapTypeId);
        }
    });

    activeVWorldLayers['urban_plan_group'] = !isActive;
    console.log((isActive ? '❌' : '✅') + ' 도시계획시설 레이어 ' + (isActive ? 'OFF' : 'ON'));
}

function toggleDevelopmentZone() {
    // 개발제한구역
    toggleVWorldLayer('lt_c_uq311');
}

function toggleBusinessDistrict() {
    // 사업지구 (택지개발, 산업단지)
    var businessLayers = [
        'lh_neoplx',    // 택지개발지구
        'lt_c_aisresc'  // 산업단지
    ];

    var isActive = activeVWorldLayers['business_district_group'];

    businessLayers.forEach(function(lid) {
        var mapTypeId = kakao.maps.MapTypeId['VWORLD_' + lid];
        if (isActive) {
            map.removeOverlayMapTypeId(mapTypeId);
        } else {
            map.addOverlayMapTypeId(mapTypeId);
        }
    });

    activeVWorldLayers['business_district_group'] = !isActive;
    console.log((isActive ? '❌' : '✅') + ' 사업지구 레이어 ' + (isActive ? 'OFF' : 'ON'));
}

console.log('📦 VWorld 레이어 모듈 로드 완료');
