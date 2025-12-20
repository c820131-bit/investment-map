# -*- coding: utf-8 -*-

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# CORS 프록시 사용하도록 URL 수정
old_url = "var url='https://api.vworld.kr/req/wfs?SERVICE=WFS&REQUEST=GetFeature&TYPENAME=lp_pa_cbnd_bubun&BBOX='+bbox+'&SRSNAME=EPSG:900913&OUTPUT=application/json&KEY='+VWORLD_KEY+'&DOMAIN=c820131-bit.github.io';"

new_url = "var url='https://corsproxy.io/?'+encodeURIComponent('https://api.vworld.kr/req/wfs?SERVICE=WFS&REQUEST=GetFeature&TYPENAME=lp_pa_cbnd_bubun&BBOX='+bbox+'&SRSNAME=EPSG:900913&OUTPUT=application/json&KEY='+VWORLD_KEY);"

content = content.replace(old_url, new_url)

# alert 제거하고 간단한 버전으로
old_func_start = '''function showParcel(lat,lng,type){
alert('1. showParcel 호출됨: '+lat+', '+lng+', '+type);'''

new_func_start = '''function showParcel(lat,lng,type){
console.log('showParcel 호출:', lat, lng, type);'''

content = content.replace(old_func_start, new_func_start)

# 나머지 alert들도 console.log로 변경
content = content.replace("alert('2. API 호출 시작');", "console.log('API 호출 시작');")
content = content.replace("alert('3. API 응답 받음, status: '+r.status);", "console.log('API 응답:', r.status);")
content = content.replace("alert('API 오류: '+r.status);", "console.log('API 오류:', r.status);")
content = content.replace("alert('4. 응답 데이터 없음');", "console.log('응답 없음');")
content = content.replace("alert('4. 필지 데이터 수신: '+(d.features?d.features.length:0)+'개');", "console.log('필지 데이터:', d.features?d.features.length:0);")
content = content.replace("alert('필지 정보 없음');", "alert('해당 위치의 필지 정보를 찾을 수 없습니다.');")
content = content.replace("alert('5. 가장 가까운 필지 없음');", "console.log('필지 없음');")
content = content.replace("alert('5. 폴리곤 생성: '+coords.length+'개 꼭지점, 타입: '+best.geometry.type);", "console.log('폴리곤 생성:', coords.length);")
content = content.replace("alert('6. 폴리곤 생성 완료!');", "console.log('폴리곤 완료');")
content = content.replace("alert('API 에러: '+e.message);", "console.log('API 에러:', e);")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("완료!")
print("- CORS 프록시 적용")
print("- 디버깅 alert 제거")
