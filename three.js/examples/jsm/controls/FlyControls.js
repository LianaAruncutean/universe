import {
	EventDispatcher,
	Quaternion,
	Vector3
} from '../../../build/three.module.js';

const _changeEvent = { type: 'change' };

class FlyControls extends EventDispatcher {

	constructor( object, domElement ) {

		super();

		if ( domElement === undefined ) {

			console.warn( 'THREE.FlyControls: The second parameter "domElement" is now mandatory.' );
			domElement = document;

		}

		this.object = object;
		this.domElement = domElement;

		// API

		this.movementSpeed = 1.0;
		this.rollSpeed = 0.005;

		this.dragToLook = false;
		this.autoForward = false;

		// disable default target object behavior

		// internals

		const scope = this;

		const EPS = 0.000001;

		const lastQuaternion = new Quaternion();
		const lastPosition = new Vector3();

		this.tmpQuaternion = new Quaternion();

		this.mouseStatus = 0;

		this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
		this.moveVector = new Vector3( 0, 0, 0 );
		this.rotationVector = new Vector3( 0, 0, 0 );

		this.keydown = function ( event ) {

			if ( event.altKey ) {

				return;

			}

			//event.preventDefault();

			switch ( event.code ) {

				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = .1; break;

				case 'KeyW': this.moveState.forward = 1; break;
				case 'KeyS': this.moveState.back = 1; break;

				case 'KeyA': this.moveState.left = 1; break;
				case 'KeyD': this.moveState.right = 1; break;

				case 'KeyR': this.moveState.up = 1; break;
				case 'KeyF': this.moveState.down = 1; break;

				case 'ArrowUp': this.moveState.pitchUp = 1; break;
				case 'ArrowDown': this.moveState.pitchDown = 1; break;

				case 'ArrowLeft': this.moveState.yawLeft = 1; break;
				case 'ArrowRight': this.moveState.yawRight = 1; break;

				case 'KeyQ': this.moveState.rollLeft = 1; break;
				case 'KeyE': this.moveState.rollRight = 1; break;

				case 'Digit1': swal({
					title: "Mercury",
					text: "Radius: 2,439.7 km \n Orbit around the Sun: 88 Earth days \n Distance from Sun: 57.91 million km \n Length of day: 58d 15h 30m",
				  }); break;
				case 'Digit2': swal({
					title: "Venus",
					text: "Radius: 6,051.8 km \n Orbit around the Sun: 225 Earth days \n Distance from Sun: 108.2 million km \n Length of day: 116d 18h 0m",
				}); break;
				case 'Digit3': swal({
					title: "Earth",
					text: "Radius: 6,371 km \n Orbit around the Sun: 365 Earth days \n Distance from Sun: 149.6 million km \n Length of day: 24h 0m 0r 23h 56m \n  https://www.businessinsider.com/scientists-animation-reveals-earth-has-2-types-of-day-2020-9",
				}); break;
				case 'Digit4': swal({
					title: "Mars",
					text: "Radius: 3,389.5 km \n Orbit around the Sun: 687 Earth days \n Distance from Sun: 227.9 million km \n Length of day: 1d 0h 37m",
				}); break;
				case 'Digit5': swal({
					title: "Jupiter",
					text: "Radius: 69,911 km \n Orbit around the Sun: 12 Earth years \n Distance from Sun: 778.5 million km \n Length of day: 0d 9h 56m",
				}); break;
				case 'Digit6': swal({
					title: "Saturn",
					text: "Radius: 58,232 km \n Orbit around the Sun: 29 Earth years \n Distance from Sun: 1.434 billion km \n Length of day: 0d 10h 42m",
				}); break;
				case 'Digit7': swal({
					title: "Uranus",
					text: "Radius: 25,362 km \n Orbit around the Sun: 84 Earth years \n Distance from Sun: 2.871 billion km \n Length of day: 0d 17h 14m",
				}); break;
				case 'Digit8': swal({
					title: "Neptune",
					text: "Radius: 24,622 km \n Orbit around the Sun: 165 Earth years \n Distance from Sun: 4.495 billion km \n Length of day: 0d 16h 6m",
				}); break;

			}

			this.updateMovementVector();
			this.updateRotationVector();

		};

		this.keyup = function ( event ) {

			switch ( event.code ) {

				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = 1; break;

				case 'KeyW': this.moveState.forward = 0; break;
				case 'KeyS': this.moveState.back = 0; break;

				case 'KeyA': this.moveState.left = 0; break;
				case 'KeyD': this.moveState.right = 0; break;

				case 'KeyR': this.moveState.up = 0; break;
				case 'KeyF': this.moveState.down = 0; break;

				case 'ArrowUp': this.moveState.pitchUp = 0; break;
				case 'ArrowDown': this.moveState.pitchDown = 0; break;

				case 'ArrowLeft': this.moveState.yawLeft = 0; break;
				case 'ArrowRight': this.moveState.yawRight = 0; break;

				case 'KeyQ': this.moveState.rollLeft = 0; break;
				case 'KeyE': this.moveState.rollRight = 0; break;

			}

			this.updateMovementVector();
			this.updateRotationVector();

		};

		this.mousedown = function ( event ) {

			if ( this.domElement !== document ) {

				this.domElement.focus();

			}

			event.preventDefault();

			if ( this.dragToLook ) {

				this.mouseStatus ++;

			} else {

				switch ( event.button ) {

					case 0: this.moveState.forward = 1; break;
					case 2: this.moveState.back = 1; break;

				}

				this.updateMovementVector();

			}

		};

		this.mousemove = function ( event ) {

			if ( ! this.dragToLook || this.mouseStatus > 0 ) {

				const container = this.getContainerDimensions();
				const halfWidth = container.size[ 0 ] / 2;
				const halfHeight = container.size[ 1 ] / 2;

				this.moveState.yawLeft = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth ) / halfWidth;
				this.moveState.pitchDown = ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

				this.updateRotationVector();

			}

		};

		this.mouseup = function ( event ) {

			event.preventDefault();
			console.log("xx")
			if ( this.dragToLook ) {

				this.mouseStatus --;

				this.moveState.yawLeft = this.moveState.pitchDown = 0;

			} else {

				switch ( event.button ) {

					case 0: this.moveState.forward = 0; break;
					case 2: this.moveState.back = 0; break;

				}

				this.updateMovementVector();

			}

			this.updateRotationVector();

		};

		this.update = function ( delta ) {

			const moveMult = delta * scope.movementSpeed;
			const rotMult = delta * scope.rollSpeed;

			scope.object.translateX( scope.moveVector.x * moveMult );
			scope.object.translateY( scope.moveVector.y * moveMult );
			scope.object.translateZ( scope.moveVector.z * moveMult );

			scope.tmpQuaternion.set( scope.rotationVector.x * rotMult, scope.rotationVector.y * rotMult, scope.rotationVector.z * rotMult, 1 ).normalize();
			scope.object.quaternion.multiply( scope.tmpQuaternion );

			if (
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS
			) {

				scope.dispatchEvent( _changeEvent );
				lastQuaternion.copy( scope.object.quaternion );
				lastPosition.copy( scope.object.position );

			}

		};

		this.updateMovementVector = function () {

			const forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

			this.moveVector.x = ( - this.moveState.left + this.moveState.right );
			this.moveVector.y = ( - this.moveState.down + this.moveState.up );
			this.moveVector.z = ( - forward + this.moveState.back );

			//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

		};

		this.updateRotationVector = function () {

			this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
			this.rotationVector.y = ( - this.moveState.yawRight + this.moveState.yawLeft );
			this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );

			//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

		};

		this.getContainerDimensions = function () {

			if ( this.domElement != document ) {

				return {
					size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
					offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
				};

			} else {

				return {
					size: [ window.innerWidth, window.innerHeight ],
					offset: [ 0, 0 ]
				};

			}

		};

		this.dispose = function () {

			this.domElement.removeEventListener( 'contextmenu', contextmenu );
			this.domElement.removeEventListener( 'mousedown', _mousedown );
			this.domElement.removeEventListener( 'mousemove', _mousemove );
			this.domElement.removeEventListener( 'mouseup', _mouseup );

			window.removeEventListener( 'keydown', _keydown );
			window.removeEventListener( 'keyup', _keyup );

		};

		const _mousemove = this.mousemove.bind( this );
		const _mousedown = this.mousedown.bind( this );
		const _mouseup = this.mouseup.bind( this );
		const _keydown = this.keydown.bind( this );
		const _keyup = this.keyup.bind( this );

		this.domElement.addEventListener( 'contextmenu', contextmenu );

		this.domElement.addEventListener( 'mousemove', _mousemove );
		this.domElement.addEventListener( 'mousedown', _mousedown );
		this.domElement.addEventListener( 'mouseup', _mouseup );

		window.addEventListener( 'keydown', _keydown );
		window.addEventListener( 'keyup', _keyup );

		this.updateMovementVector();
		this.updateRotationVector();

	}

}

function contextmenu( event ) {

	event.preventDefault();

}

export { FlyControls };
