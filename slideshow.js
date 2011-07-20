/*
	Class: Slideshow

	A simple slideshow class.

	Date:
		2011-07-20

	Author:
		Charly Lersteau

	Options:
		period - (number) The duration of the intervals between slides (ms).
		fx - (string) Default transition effect (default: 'crossFade').
		fxOptions - (object) Effect options, please see Mootools Core Fx
			(default: link:'cancel',duration:'long').
		autoplay - (bool) Play at startup (default: true).
		classSlideshow - (string) The class of the slideshow container
			(default: 'tuiny-slideshow').
		classSlide - (string) The class of the slides contained when
			javascript is enabled (default: 'tuiny-slideshow-slide').

	CSS example:
		Example of a 600x400 slideshow to center and auto-scale images.
		>	#slideshow
		>	{
		>		width: 600px;
		>		height: 400px;
		>	}
		>	#slideshow .tuiny-slideshow-slide
		>	{
		>		text-align: center;
		>		line-height: 400px;
		>	}
		>	#slideshow .tuiny-slideshow-slide img
		>	{
		>		max-width: 100%;
		>		max-height: 100%;
		>		vertical-align: middle;
		>	}
*/
var Slideshow = new Class(
{
	Implements: [ Options, Events ],

	options:
	{
		period: 3000,
		fx: 'crossFade',
		fxOptions:
		{
			link: 'cancel',
			duration: 'long'
		},
		autoplay: true,
		classSlideshow: 'tuiny-slideshow',
		classSlide: 'tuiny-slideshow-slide'
	},

	/*
		Constructor: Slideshow

		Syntax:
			> var mySlideshow = new Slideshow(element, [options]);

		Parameters:
			element - (Element) The container element.
			options - (object) The options.
	*/
	initialize: function( element, options )
	{
		this.setOptions( options );
		this.element = document.id( element );
		this.build();

		if ( this.options.autoplay )
		{
			this.play();
		}
	},

	/*
		Method: play

		Syntax:
			> mySlideshow.play();

		Returns:
			this
	*/
	play: function()
	{
		this.setInterval();
		this.fireEvent( 'play' );
		return this;
	},

	/*
		Method: play

		Syntax:
			> mySlideshow.stop();

		Returns:
			this
	*/
	stop: function()
	{
		this.clearInterval();
		this.fireEvent( 'stop' );
		return this;
	},

	/*
		Method: show

		Syntax:
			> mySlideshow.show( slide );

		Parameters:
			slide - (Element|Number|String) Slide element to show.
				Also accepted :
					a reference to a slide element,
					a number: 0, 1, 2, ...,
					a string: 'first', 'last', 'previous', 'next'.

		Returns:
			this
	*/
	show: function( slide, callback )
	{
		if ( this.interval && !callback )
		{
			this.resetInterval();
		}

		if ( this.fxRunning && instanceOf( this.fx, Fx ) )
		{
			this.fx.cancel();
			this.fxComplete();
		}

		if ( instanceOf( slide, String ) )
		{
			slide = this.findByString( slide );
		}
		else if ( instanceOf( slide, Number ) )
		{
			slide = this.slides[ slide ];
		}

		var previous = this.current.setStyle( 'z-index', 1 );
		this.current = slide;
		this.reset( slide );

		this.fx = slide.retrieve( 'tuiny.slideshow.fx' );

		this.fireEvent( 'show', [ slide, this.slides.indexOf( slide ) ] );

		if ( instanceOf( this.fx, Fx ) )
		{
			this.fxRunning = true;
			this.fx.start({
				previous: previous,
				instance: this
			});
		}
		else
		{
			this.fxComplete();
		}
		return this;
	},

	reset: function( slide )
	{
		slide.set( 'style', slide.retrieve( 'tuiny.slideshow.style' ) );
		return this;
	},

	setInterval: function()
	{
		this.interval = this.show.periodical( this.options.period, this, [ 'next', true ] );
		return this;
	},

	clearInterval: function()
	{
		clearInterval( this.interval );
		this.interval = null;
		return this;
	},

	resetInterval: function()
	{
		this.clearInterval().setInterval();
		return this;
	},

	findByString: function( slide, ref )
	{
		var index = this.slides.indexOf( ref || this.current );

		switch ( slide )
		{
			case 'first':
				index = 0;
				break;
			case 'last':
				index = this.slides.length - 1;
				break;
			case 'previous':
				index--;
				if ( index < 0 )
				{
					index = this.slides.length - 1;
				}
				break;
			case 'next':
				index++;
				if ( index >= this.slides.length )
				{
					index = 0;
				}
				break;
		}
		return this.slides[ index ];
	},

	fxComplete: function()
	{
		this.slides.each( function( slide )
		{
			if ( slide != this.current )
			{
				slide.setStyle( 'display', 'none' );
			}
		}, this );
		this.fxRunning = false;
	},

	build: function()
	{
		this.element.setStyles(
		{
			'position': 'relative', // Needed to set slide size to 100%
			'overflow': 'hidden'    // Needed by some effects
		});

		this.slides = this.element.getChildren();

		this.slides.each( function( slide, index )
		{
			// Parse class attribute values (name:<JSON value> ...)
			var options = {};
			var data = slide.get( 'class' ).split( ' ' );

			data.each( function( s )
			{
				var split = s.split( ':' );
				if ( split[ 1 ] && split[ 0 ] )
				{
					try
					{
						options[ split[ 0 ] ] = JSON.decode( split[ 1 ] );
					}
					catch ( e )
					{
						if ( window.console ) window.console.log( e );
					}
				}
			});

			// Set and save styles
			slide.addClass( this.options.classSlide ).setStyles(
			{
				'position': 'absolute',
				'width': '100%',
				'height': '100%',
				'display': 'block',
				'z-index': 0
			});

			slide.store( 'tuiny.slideshow.style', slide.get( 'style' ) );

			// Setup fx
			var fxClass = options.fx ? Slideshow.Fx[ options.fx ] : Slideshow.Fx[ this.options.fx ];

			if ( fxClass )
			{
				var options = Object.merge( this.options.fxOptions, options.fxOptions );
				var fx = new fxClass( slide, options );
				fx.addEvent( 'complete', this.fxComplete.bind( this ) );
				slide.store( 'tuiny.slideshow.fx', fx );
			}

			// Hide after saving styles
			if ( index > 0 )
			{
				slide.setStyle( 'display', 'none' );
			}

			slide.store( 'tuiny.slideshow.options', options );
		}, this );

		this.current = this.slides[ 0 ];
	}
});

/* Effects */

/*
	Class: Slideshow.Fx

	A slideshow effect class.

	Extends: Fx
*/
Slideshow.Fx = new Class(
{
	Extends: Fx,

	/*
		Constructor: Slideshow.Fx

		Parameters:
			next - (Element) The next element to be shown (this.next).
			options - (object) The options.
	*/
	initialize: function( next, options )
	{
		this.next = next;
		this.parent( options );
	}
});

Slideshow.Fx.fade = new Class(
{
	Extends: Slideshow.Fx,

	start: function( data )
	{
		this.previous = data.previous;
		this.previous.setStyle( 'z-index', 1 );
		this.next.setStyle( 'z-index', 0 );
		this.parent( 1, 0 );
		return this;
	},

	set: function( now )
	{
		this.previous.set( 'opacity', now );
	}
});

Slideshow.Fx.crossFade = new Class(
{
	Extends: Slideshow.Fx,

	start: function( data )
	{
		this.previous = data.previous;
		this.parent( 0, 1 );
		return this;
	},

	set: function( now )
	{
		this.next.set( 'opacity', now );
		this.previous.set( 'opacity', 1 - now );
	}
});

Slideshow.Fx.slideBase = new Class(
{
	Extends: Slideshow.Fx,

	direction: null, // 'x' or 'y'
	property: null,  // 'top', 'right', 'bottom' or 'left'

	start: function( data )
	{
		this.previous = data.previous;
		this.maxValue = this.previous.getSize()[ this.direction ].toFloat();

		this.previous.setStyle( 'z-index', 1 );
		this.next.setStyle( 'z-index', 0 );
		this.parent( 0, 1 );
		return this;
	},

	set: function( now )
	{
		this.previous.setStyle( this.property, this.maxValue * now );
	}
});

Slideshow.Fx.slideUp = new Class(
{
	Extends: Slideshow.Fx.slideBase,
	direction: 'y',
	property: 'bottom'
});

Slideshow.Fx.slideDown = new Class(
{
	Extends: Slideshow.Fx.slideBase,
	direction: 'y',
	property: 'top'
});

Slideshow.Fx.slideLeft = new Class(
{
	Extends: Slideshow.Fx.slideBase,
	direction: 'x',
	property: 'right'
});

Slideshow.Fx.slideRight = new Class(
{
	Extends: Slideshow.Fx.slideBase,
	direction: 'x',
	property: 'left'
});

Slideshow.Fx.matrixBase = new Class(
{
	Extends: Slideshow.Fx,

	options:
	{
		rows: 8,
		cols: 6
	},

	initialize: function( next, options )
	{
		this.parent( next, options );

		this.matrix = new Array;
		this.count  = this.options.rows * this.options.cols;

		for ( var i = 0; i < this.count; i++ )
		{
			this.matrix.push( this.next.clone()
				.setStyles({
					'display': 'none',
					'z-index': 1
				})
				.inject( this.next, 'after' )
			);
		}

		this.resize();

		this.addEvent( 'complete', this.end );
		this.addEvent( 'chainComplete', this.end );
		this.addEvent( 'cancel', this.end );
	},

	start: function( data )
	{
		if ( this.size != this.next.getSize() )
		{
			this.resize();
		}

		new Elements( this.matrix ).setStyle( 'display', 'none' );

		this.previous = data.previous.setStyle( 'z-index', 0 );
		this.next.setStyle( 'display', 'none' );

		this.current = 0;
		this.index = this.sequence();
		this.parent( 0, this.count );
		return this;
	},

	set: function( now )
	{
		var k = Math.ceil( now );

		while ( this.current < this.count && this.current <= k )
		{
			var indexes = Array.from( this.index[ this.current ] );
			var elements = this.matrix.filter( function( r, i ) {
				return indexes.indexOf( i ) >= 0;
			});
			new Elements( elements ).setStyle( 'display', 'block' );
			this.current++;
		}
	},

	sequence: function()
	{
		var s = new Array;
		for ( var k = 0; k < this.count; k++ )
		{
			s.push( k );
		}
		return s;
	},

	resize: function()
	{
		this.size = this.next.getSize();
		var w = this.size.x / this.options.rows;
		var h = this.size.y / this.options.cols;

		for ( var i = 0; i < this.options.rows; i++ )
		{
			for ( var j = 0; j < this.options.cols; j++ )
			{
				var k = i * this.options.cols + j;
				this.matrix[ k ].setStyle( 'clip', this.rect( i, j, w, h ) );
			}
		}
	},

	rect: function( i, j, w, h )
	{
		var top = j * h,
		right   = ( i + 1 ) * w,
		bottom  = ( j + 1 ) * h,
		left    = i * w;
		return 'rect('+top+'px,'+right+'px,'+bottom+'px,'+left+'px)';
	},

	end: function()
	{
		this.next.setStyle( 'display', 'block' );
		new Elements( this.matrix ).setStyle( 'display', 'none' );
	}
});

Slideshow.Fx.matrixRandom = new Class(
{
	Extends: Slideshow.Fx.matrixBase,

	sequence: function()
	{
		return this.parent().sort( function() {
			return Math.round( Math.random() ) - 0.5;
		});
	}
});