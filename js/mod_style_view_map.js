(function ($) {
  Drupal.behaviors.mod_style_view_map = {
    attach: function(context, settings) {
      Drupal.geoField = Drupal.geoField || {};
      Drupal.geoField.maps = Drupal.geoField.maps || {};

      $('.geomap_style', context).once('geofield-processed', function(index, element) {
        var data = undefined;
        var map_settings = [];
        var pointCount = 0;
        var resetZoom = true;
        var elemID = $(element).attr('id');
        var markers = [];
        if(settings.mod_style_view_map[elemID]) {
            data = settings.mod_style_view_map[elemID].data;
            map_settings = settings.mod_style_view_map[elemID].map_settings;
        }

        // Checking to see if google variable exists. We need this b/c views breaks this sometimes. Probably
        // an AJAX/external javascript bug in core or something.
        if (typeof google != 'undefined' && typeof google.maps.ZoomControlStyle != 'undefined' && data != undefined) {
          var features = GeoJSON(data);

          // controltype
          var controltype = map_settings.controltype;
          if (controltype == 'default') { controltype = google.maps.ZoomControlStyle.DEFAULT; }
          else if (controltype == 'small') { controltype = google.maps.ZoomControlStyle.SMALL; }
          else if (controltype == 'large') { controltype = google.maps.ZoomControlStyle.LARGE; }
          else { controltype = false }

          // map type
          var maptype = map_settings.maptype;
          if (maptype) {
            if (maptype == 'map' && map_settings.baselayers_map) { maptype = google.maps.MapTypeId.ROADMAP; }
            if (maptype == 'satellite' && map_settings.baselayers_satellite) { maptype = google.maps.MapTypeId.SATELLITE; }
            if (maptype == 'hybrid' && map_settings.baselayers_hybrid) { maptype = google.maps.MapTypeId.HYBRID; }
            if (maptype == 'physical' && map_settings.baselayers_physical) { maptype = google.maps.MapTypeId.TERRAIN; }
          }
          else { maptype = google.maps.MapTypeId.ROADMAP; }

          // menu type
          var mtc = map_settings.mtc;
          if (mtc == 'standard') { mtc = google.maps.MapTypeControlStyle.HORIZONTAL_BAR; }
          else if (mtc == 'menu' ) { mtc = google.maps.MapTypeControlStyle.DROPDOWN_MENU; }
          else { mtc = false; }

          // map style
          var map_style = (map_settings.mod_style_map != '' ? JSON.parse(map_settings.mod_style_map) : '[]');
          var myOptions = {
            zoom: parseInt(map_settings.zoom),
            minZoom: parseInt(map_settings.min_zoom),
            maxZoom: parseInt(map_settings.max_zoom),
            mapTypeId: maptype,
            mapTypeControl: (mtc ? true : false),
            mapTypeControlOptions: {style: mtc},
            zoomControl: ((controltype !== false) ? true : false),
            zoomControlOptions: {style: controltype},
            styles: map_style,
            panControl: (map_settings.pancontrol ? true : false),
            scrollwheel: (map_settings.scrollwheel ? true : false),
            draggable: (map_settings.draggable ? true : false),
            overviewMapControl: (map_settings.overview ? true : false),
            overviewMapControlOptions: {opened: (map_settings.overview_opened ? true : false)},
            streetViewControl: (map_settings.streetview_show ? true : false),
            scaleControl: (map_settings.scale ? true : false),
            scaleControlOptions: {style: google.maps.ScaleControlStyle.DEFAULT}
          };

          var map = new google.maps.Map($(element).get(0), myOptions);
          // Store a reference to the map object so other code can interact
          // with it.
          Drupal.geoField.maps[elemID] = map;
          var range = new google.maps.LatLngBounds();

          var infowindow = new google.maps.InfoWindow({
            content: ''
          });


          if (features.setMap) {
            placeFeature(features, map, range);
            // Don't move the default zoom if we're only displaying one point.
            if (features.getPosition) {
              resetZoom = false;
            }
          } else {
            for (var i in features) {
              if (features[i].setMap) {
                placeFeature(features[i], map, range);
              } else {
                for (var j in features[i]) {
                  if (features[i][j].setMap) {
                    placeFeature(features[i][j], map, range);
                  }
                }
              }
            }
          }

           if(map_settings.center != null){
            var center = map_settings.center;
            map.setCenter(new google.maps.LatLng(center.lat, center.lon));
            }
            else{
               if (resetZoom) {
                  map.fitBounds(range);
              } else {
                  map.setCenter(range.getCenter());
              }
            }
        }
        
        function placeFeature(feature, map, range) {
          var properties = feature.get('geojsonProperties');
          if (feature.setTitle && properties && properties.title) {
            feature.setTitle(properties.title);
          }
          if (feature.getPosition) {
            range.extend(feature.getPosition());
          } else {
            var path = feature.getPath();
            path.forEach(function(element) {
              range.extend(element);
            });
          }
          var bounds = feature.get('bounds');
          var marker = new google.maps.Marker({
            map:map,
            animation: google.maps.Animation.DROP,
            position: bounds.getCenter(),
            html: properties.description,
            icon: {
              url:  (map_settings.mod_marker != '' ? map_settings.mod_marker : ''), // url marker
              scaledSize: new google.maps.Size(50, 50), // scaled size
              origin: new google.maps.Point(0,0), // origin
              anchor: new google.maps.Point(0, 0) // anchor
            }
          });
          markers.push(marker);
          if (properties && properties.description) {
            google.maps.event.addListener(marker, 'click', function() {
              infowindow.setPosition(bounds.getCenter());
              infowindow.setContent(properties.description);
              infowindow.open(map,marker);
            });
          }
          marker.addListener('click',function(){
            if (marker.getAnimation() !== null) {
              marker.setAnimation(null);
            } else {
              marker.setAnimation(google.maps.Animation.BOUNCE);
            }
          });

        }
        var markerCluster = new MarkerClusterer(map, markers);
      });
    }
  }
})(jQuery);
