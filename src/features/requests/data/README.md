# Bangladesh district map data

`bangladesh-districts.json` contains simplified district polygons from the Bangladesh Directorate General of Health Services ArcGIS layer `bgd_admbnda_adm2_bbs_20201113` (district boundaries attributed to BBS):

https://gis.dghs.gov.bd/server/rest/services/Hosted/bgd_admbnda_adm2_bbs_20201113/FeatureServer/0

The geometries are simplified for small in-card maps. Names are normalized in `../components/district-map.tsx` to match the app's district constants.
