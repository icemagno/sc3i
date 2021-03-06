var usersSource = null;
var userLayer = null;

function usersStyleFunction( feature, resolution ) {
	var props = feature.getProperties();
	var resultStyles = [];
	var image = 'admin.png';

	if ( props.roleName === 'ROLE_FIREMAN') {
		image = 'fireman.png';
	}

	if ( props.roleName === 'ROLE_DRONE') {
		image = 'drone.png';
	}

	var adminStyle = new ol.style.Style({
		image: new ol.style.Icon(({
			scale : 1,
			anchor: [0.5, 0.5],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			opacity: 1.0,
			src: '/phoenix/resources/img/' + image,
		})),
		text: new ol.style.Text({
			font: '10px Consolas',
			textAlign: 'center',
			offsetX: 0,
			offsetY: 20,
			scale : 1,
			textBaseline: 'middle',
			fill: new ol.style.Fill({ color: '#f90404' }),
			stroke: new ol.style.Stroke({
				color: '#FFFFFF', width: 1
			}),
			text: props.fullName,
		})    			
	});

	resultStyles.push( adminStyle );
	return resultStyles;	

}

function flyTo(location, done) {
	var view = theMap.getView();
	var duration = 4000;
	var zoom = view.getZoom();
	var parts = 2;
	var called = false;
	function callback(complete) {
		--parts;
		if (called) {
			return;
		}
		if (parts === 0 || !complete) {
			called = true;
			done(complete);
		}
	}
	view.animate({
		center: location,
		duration: duration
	}, callback);
	view.animate({
		zoom: zoom - 1,
		duration: duration / 2
	}, {
		zoom: zoom,
		duration: duration / 2
	}, callback);
}

function addUserToMap( user ) {

	// Deixa adicionar eu mesmo...
	/*
	if( globalUser.name == user.user.name ) {
		return;
	}
	 */
	console.log("Add User to Map");
	console.log( user );
	
	var projection = theView.getProjection();
	var center = ol.proj.transform( [ user.position[1], user.position[0] ], 'EPSG:4326', projection)

	var thing = new ol.geom.Point( center );
	var featurething = new ol.Feature({
		name: user.name,
		geometry: thing,
	});

	var roleName = user.user.roleName;
	var fullName = user.user.fullName;
	var remoteAddress = user.user.remoteAddress;

	featurething.set("email", user.user.email );
	featurething.set("fullName", fullName );
	featurething.set("name", user.user.name );
	featurething.set("roleName", roleName );
	featurething.set("remoteAddress", remoteAddress );
	usersSource.addFeature( featurething );

	// Zoom para o novo usuario online
	//theMap.getView().animate({center: center, zoom: 10, duration : 2000});
	flyTo(center, function() {});

	if( roleName === 'ROLE_ADMIN' ) {
		// http://bootstrap-growl.remabledesigns.com
		$.notify({
			// options
			title : '',
			message: 'Administrador ' + fullName + ' está online.' 
		},{
			// settings
			type: 'success',
			delay : 3000,
			animate: {
				enter: 'animated fadeInRight',
				exit: 'animated fadeOutUp'
			}			
		});
	}

	if( roleName === 'ROLE_FIREMAN' ) {
		// http://bootstrap-growl.remabledesigns.com
		$.notify({
			// options
			title : '',
			message: 'Unidade ' + fullName + ' está online.' 
		},{
			// settings
			type: 'warning',
			delay : 3000,
			animate: {
				enter: 'animated fadeInRight',
				exit: 'animated fadeOutRight'
			}			
		});
	}

	if( roleName === 'ROLE_USER' ) {
		$.notify({
			title : '',
			message: 'Usuário ' + fullName + ' está online.' 
		},{
			// settings
			type: 'success',
			delay : 3000,
			animate: {
				enter: 'animated fadeInRight',
				exit: 'animated fadeOutRight'
			}			
		});
	}


	if( roleName === 'ROLE_DRONE' ) {
		// http://bootstrap-growl.remabledesigns.com
		$.notify({
			// options
			title : '',
			message: 'Drone ' + fullName + ' está online.' 
		},{
			// settings
			type: 'danger',
			delay : 3000,
			animate: {
				enter: 'animated fadeInRight',
				exit: 'animated fadeOutRight'
			}			
		});
	}

	return featurething;
}

function deleteUser( userName ) {
	var features = usersSource.getFeatures();
	for ( x=0; x < features.length; x++ ) {
		var feature = features[x];
		usersSource.removeFeature( feature );
	}
}	

function initUserLayer() {
	usersSource = new ol.source.Vector({
		projection: theView.getProjection(),
	});

	userLayer = new ol.layer.Vector({
		source: usersSource,
		style: usersStyleFunction
	});	
	userLayer.set('layerName', 'userLayer');
	theMap.addLayer( userLayer );

}

