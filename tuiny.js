/*
Title: Tuiny

Description:
	Tuiny is a lightweight Javascript user interface library based on
	Mootools 1.3.

Author:
	Charly LERSTEAU

Date:
	2011-04-27

License:
	MIT style license

Mootools:
	<http://www.mootools.net>
*/

var Tuiny =
{
};

/*
	Class: Tuiny.Widget

	Base class for all widgets.

	Widget classes should have a 'this.element' field corresponding to the
	widget container.
*/
Tuiny.Widget = new Class(
{
	Implements: [Options, Events],

	/*
		Constructor: Tuiny.Widget

		Parameters:
			options - The options.
	*/
	initialize: function( options )
	{
		this.setOptions( options );
	},

	/*
		Method: toElement

		Syntax:
			> var myElement = myWidget.toElement();

		Returns:
			(Element) The DOM element
	*/
	toElement: function()
	{
		return this.element;
	}
});

/*
	Method: Element.toWidget

	A method to retrieve the widget instance associated with an element.

	Syntax:
		> var myWidget = myElement.toWidget();

	Returns:
		(Tuiny.Widget) The widget class.
*/
Element.implement(
{
	toWidget: function()
	{
		return this.retrieve( 'widget' );
	}
});

/*
	Class: Tuiny.Frame

	Base class for all resizable widget containers.

	A <Tuiny.Frame> is composed of a container div and a content div.

		_Non-resizable frame_

		>	+-----------------+
		>	|     element     |
		>	|   +---------+   |
		>	|   |         |   |
		>	|   | content |   |
		>	|   |         |   |
		>	|   +---------+   |
		>	+-----------------+

		_Resizable frame_

		>	+-----------------------+
		>	|        element        |
		>	|  +---+---------+---+  |
		>	|  |nw |    n    |ne |  |
		>	|  +---+---------+---+  |
		>	|  |   |         |   |  |
		>	|  | w | content | e |  |
		>	|  |   |         |   |  |
		>	|  +---+---------+---+  |
		>	|  |sw |    s    |se |  |
		>	|  +---+---------+---+  |
		>	+-----------------------+

	Extends:
		<Tuiny.Widget>


	Options:
		position - (object|string) Position at screen
			(default: 'center').
		width - (integer) Width at creation (default: 300).
		height - (integer) Height at creation (default: 200).
		resizable - (boolean) The user can resize the frame
			(default: true).
		resizeDirections - (array) Resizing directions allowed.
			(default: ['nw','n','ne','e','se','s','sw','w']).
		classFrame - (string) The class of the total frame area
			(default: 'tuiny-frame').
		classContent - (string) The class of the content area
			(default: 'tuiny-content').
		classResizer - (string) The class of the resizers
			(default: 'tuiny-resizer').
*/
Tuiny.Frame = new Class(
{
	Extends: Tuiny.Widget,

	options:
	{
		position: 'center',
		width: 300,
		height: 200,
		resizable: true,
		resizeDirections: [ 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w' ],
		classFrame: 'tuiny-frame',
		classContent: 'tuiny-content',
		classResizer: 'tuiny-resizer'
	},

	/*
		Constructor: Tuiny.Frame

		Syntax:
			> var myFrame = new Tuiny.Frame([options, container]);

		Parameters:
			options - The options.
			container - The container element.
	*/
	initialize: function()
	{
		var params = Array.link( arguments, { options: Type.isObject, container: Type.isElement } );
		this.parent( params.options );

		this.container = params.container || $( document.body );
		this.build();

		this.move( this.options.position );
	},

	/*
		Method: move

		Moves the frame.

		Position argument:

			There are two ways to specify the position: strings and objects.

			The strings are combinations of "left", "right", and "center"
			with "top" (or "upper"), "bottom", and "center".

			These are case insensitive.

			These translate to:

			o	upperLeft, topLeft (same thing) - or upperleft, leftupper, LEFTUPPER etc.
			o	bottomLeft
			o	centerLeft
			o	upperRight, topRight (same thing)
			o	bottomRight
			o	centerRight
			o	centerTop
			o	centerBottom
			o	center

			Alternatively, you can be a little more expicit by using an
			object with x and y values.

			Acceptable values for the x axis are "left", "right", and "center",
			and for y you can use "top", "bottom" and "center",
			and for both you can use integer values in pixels.

			>	{x: 'left', y: 'top'} // same as "upperLeft" or "topLeft"
			>	{x: 'left', y: 'bottom'} // same as "bottomLeft"
			>	{x: 200, y: 200} // left: 200px, top: 200px
			>	{x: 200, y: 'bottom'} // left: 200px, "bottom"
			>	etc.

		Syntax:
			> frame.move( position );

		Parameters:
			position - (object|string) Position at screen.

		Example:
			>	// By string
			>	myFrame.move( 'center' );
			>	myFrame.move( 'UPPERleft' );
			>
			>	// By object of strings
			>	myFrame.move( { x: 'left', y: 'bottom' } );
			>	myFrame.move( { x: 'center', y: 'center' } );
			>
			>	// By object of integers
			>	myFrame.move( { x: 200, y: 200 } );
			>
			>	// Mixed
			>	myFrame.move( { x: 'center', y: 200 } );
			>	myFrame.move( { x: 400, y: 'bottom' } );
	*/
	move: function( position )
	{
		var winSize = window.getSize();
		var elSize  = this.element.getSize();
		var elPosition = this.element.getPosition();

		var strToObj =
		{
			'upperleft':    { x: 'left', y: 'top' },
			'topleft':      { x: 'left', y: 'top' },
			'bottomleft':   { x: 'left', y: 'bottom' },
			'centerleft':   { x: 'left', y: 'center' },
			'upperright':   { x: 'right', y: 'top' },
			'topright':     { x: 'right', y: 'top' },
			'bottomright':  { x: 'right', y: 'bottom' },
			'centerright':  { x: 'right', y: 'center' },
			'centertop':    { x: 'center', y: 'top' },
			'centerbottom': { x: 'center', y: 'bottom' },
			'center':       { x: 'center', y: 'center' },
			'left':         { x: 'left', y: elPosition.y },
			'right':        { x: 'right', y: elPosition.y },
			'top':          { x: elPosition.x, y: 'top' },
			'bottom':       { x: elPosition.x, y: 'bottom' }
		};

		var strToIntX =
		{
			'left':   0,
			'right':  Math.max( 0, winSize.x - elSize.x ),
			'center': Math.max( 0, winSize.x / 2 - elSize.x / 2 )
		};

		var strToIntY =
		{
			'top':    0,
			'bottom': Math.max( 0, winSize.y - elSize.y ),
			'center': Math.max( 0, winSize.y / 2 - elSize.y / 2 )
		};

		if ( instanceOf( position, String ) )
		{
			var key = position.toLowerCase();
			position = strToObj[ key ];
		}

		if ( instanceOf( position.x, Number ) )
			this.element.setStyle( 'left', position.x );
		else
			this.element.setStyle( 'left', strToIntX[ position.x.toLowerCase() ] );

		if ( instanceOf( position.y, Number ) )
			this.element.setStyle( 'top', position.y );
		else
			this.element.setStyle( 'top', strToIntY[ position.y.toLowerCase() ] );
	},

	/*
		Method: getContent

		Retrieves the content element.

		Syntax:
			> var contentElement = frame.getContent();

		Returns:
			(Element) The content element.
	*/
	getContent: function()
	{
		return this.content;
	},

	/*
		Method: enableResize

		Enables resizing.

		Syntax:
			> frame.enableResize([directions]);

		Parameters:
			directions - (array; optional). The directions between
				'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'.
	*/
	enableResize: function( directions )
	{
		if ( !this.resizer ) this.buildResizers();

		// this.options.resizeDirections are allowed resize directions.
		// If directions argument is specified, we need to add these
		// directions in this.options.resizeDirections. Then, next
		// call of disableResize without argument will affect these
		// directions.
		if ( directions )
			this.options.resizeDirections.combine( directions );
		else
			directions = this.options.resizeDirections;

		var attachDrag = function( drag ) { drag.attach(); };
		var enableFunc = function( dir )
		{
			this.resizeDrag[ dir ].each( attachDrag );
			this.resizer[ dir ].removeClass( this.options.classResizer+'-disabled' );
		};

		Object.values( directions ).each( enableFunc.bind( this ) );
	},

	/*
		Method: disableResize

		Disables resizing.

		Syntax:
			> frame.disableResize([directions]);

		Parameters:
			directions - (array; optional). The directions between
				'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'.
	*/
	disableResize: function( directions )
	{
		if ( !this.resizer ) return;

		var removeDir = function( dir ) { this.options.resizeDirections.erase( dir ); };

		// this.options.resizeDirections are allowed resize directions.
		// If directions argument is specified, we need to remove these
		// directions from this.options.resizeDirections. Then, next
		// call of enableResize without argument will not enable these
		// directions.
		if ( directions )
			directions.each( removeDir.bind( this ) );
		else
			directions = this.options.resizeDirections;

		var detachDrag = function( drag ) { drag.detach(); };
		var disableFunc = function( dir )
		{
			this.resizeDrag[ dir ].each( detachDrag );
			this.resizer[ dir ].addClass( this.options.classResizer+'-disabled' );
		};

		Object.values( directions ).each( disableFunc.bind( this ) );
	},

	build: function()
	{
		// Container element
		this.element = new Element( 'div',
		{
			'class': this.options.classFrame
		});
		this.element.store( 'widget', this );

		// Content element
		this.content = new Element( 'div',
		{
			'class': this.options.classContent,
			'styles': { 'width': this.options.width, 'height': this.options.height }
		});
		this.content.store( 'widget', this );
		this.element.adopt( this.content );

		// Resizers
		if ( this.options.resizable )
			this.buildResizers();

		this.container.adopt( this.element );
	},

	buildResizers: function()
	{
		if ( this.resizer ) return;

		this.resizer = {};
		this.resizeDrag = {};

		// Value on key '_' will be the first argument of 'new Drag(...)'.
		var dragOptions =
		{
			'nw': [ { 'modifiers': { x: 'left',  y: 'top'    }, '_': this.element },
				{ 'modifiers': { x: 'width', y: 'height' }, 'invert': true    } ],
			'n':  [ { 'modifiers': { x: false,   y: 'top'    }, '_': this.element },
				{ 'modifiers': { x: false,   y: 'height' }, 'invert': true    } ],
			'ne': [ { 'modifiers': { x: false,   y: 'top'    }, '_': this.element },
				{ 'modifiers': { x: 'width', y: false    } },
				{ 'modifiers': { x: false,   y: 'height' }, 'invert': true    } ],
			'e':  [ { 'modifiers': { x: 'width', y: false    } } ],
			'se': [ { 'modifiers': { x: 'width', y: 'height' } } ],
			's':  [ { 'modifiers': { x: false,   y: 'height' } } ],
			'sw': [ { 'modifiers': { x: 'left',  y: false    }, '_': this.element },
				{ 'modifiers': { x: false,   y: 'height' } },
				{ 'modifiers': { x: 'width', y: false    }, 'invert': true    } ],
			'w':  [ { 'modifiers': { x: 'left',  y: false    }, '_': this.element },
				{ 'modifiers': { x: 'width', y: false    }, 'invert': true    } ]
		};

		var configDrag = function( opt, dir )
		{
			this.resizer[ dir ] = new Element( 'div', { 'class': this.options.classResizer+'-'+dir } );
			this.resizer[ dir ].store( 'widget', this );
			this.resizeDrag[ dir ] = new Array;
			dragOptions[ dir ].each( function( options )
			{
				var el = options._ || this.content;
				this.resizeDrag[ dir ].push( new Drag( el, Object.merge( { 'handle': this.resizer[ dir ] }, options ) ) );
			}.bind( this ));
			this.element.adopt( this.resizer[ dir ] );
		};

		Object.map( dragOptions, configDrag, this );
	}
});

/*
	Class: Tuiny.Panel

	A <Tuiny.Frame> with a header, a content area and a footer.

	The set of header, content and footer areas is called the client area.

	>	+-----------------------+
	>	|        element        |
	>	|  +-----------------+  |
	>	|  |     header      |  |
	>	|  +-----------------+  |
	>	|  |                 |  |
	>	|  |     content     |  |
	>	|  |                 |  |
	>	|  +-----------------+  |
	>	|  |     footer      |  |
	>	|  +-----------------+  |
	>	+-----------------------+

	Extends:
		<Tuiny.Frame>

	Options:
		classPanel - (string) The class of the total panel area
			(default: 'tuiny-panel').
		classHeader - (string) The class of the header area
			(default: 'tuiny-header').
		classFooter - (string) The class of the footer area
			(default: 'tuiny-footer').
*/
Tuiny.Panel = new Class(
{
	Extends: Tuiny.Frame,

	options:
	{
		classPanel: 'tuiny-panel',
		classHeader: 'tuiny-header',
		classWrapper: 'tuiny-wrapper',
		classFooter: 'tuiny-footer'
	},

	/*
		Constructor: Tuiny.Panel

		Syntax:
			> var myPanel = new Tuiny.Panel([options, container]);

		Parameters:
			options - The options.
			container - The container element.
	*/
	initialize: function()
	{
		var params = Array.link( arguments, { options: Type.isObject, container: Type.isElement } );
		this.parent( params.options, params.container );
	},

	/*
		Method: getHeader

		Retrieves the header element.

		Syntax:
			> var myElement = myPanel.getHeader();

		Returns:
			(Element) The header area.
	*/
	getHeader: function()
	{
		return this.header;
	},

	/*
		Method: getFooter

		Retrieves the footer element.

		Syntax:
			> var myElement = myPanel.getFooter();

		Returns:
			(Element) The footer area.
	*/
	getFooter: function()
	{
		return this.footer;
	},

	build: function()
	{
		this.parent();
		this.element.addClass( this.options.classPanel );

		this.header  = new Element( 'div', { 'class': this.options.classHeader } );
		this.footer  = new Element( 'div', { 'class': this.options.classFooter } );

		this.header.store( 'widget', this );
		this.footer.store( 'widget', this );

		this.element.adopt( [ this.header, this.content, this.footer ] );
	}
});

/*
	Class: Tuiny.Window

	A <Tuiny.Panel> with a label text and a control bar.

	>	+-----------------------+
	>	|        element        |
	>	|  +-----+-----------+  |
	>	|  | x _ | label     |  |
	>	|  +-----+-----------+  |
	>	|  |     header      |  |
	>	|  +-----------------+  |
	>	|  |                 |  |
	>	|  |     content     |  |
	>	|  |                 |  |
	>	|  +-----------------+  |
	>	|  |     footer      |  |
	>	|  +-----------------+  |
	>	+-----------------------+

	Example:
	>	var myWindow = new Tuiny.Window( { label: 'My window' } );
	>
	>	// Close button
	>	myWindow.getControlBar().adopt( new Tuiny.Button(
	>	{
	>		'label': ' x ',
	>		'events': { 'click': myWindow.close.bind( myWindow ) }
	>	}));
	>
	>	// Collapse button
	>	myWindow.getControlBar().adopt( new Tuiny.Button(
	>	{
	>		'label': ' _ ',
	>		'events': { 'click': myWindow.toggleCollapse.bind( myWindow ) }
	>	}));

	Extends:
		<Tuiny.Panel>

	Options:
		label - (string) Text of the label (default: '&nbsp;')
		draggable - (bool) The user can move the window by dragging the
			label (default: true).
		dragLimit - (object) An object with an x and a y property, both
			an array containing the minimum and maximum limit of
			movement of the window.
		collapsible - (bool) The user can collapse the window with a
			double click on the label area (default: true).
		collapseTrigger - (string) The event that collapses the window
			(default: 'dblclick').
		classWindow - (string) The class of the total window area
			(default: 'tuiny-window').
		classLabel - (string) The class of the label text
			(default: 'tuiny-label').
		classControlBar - (string) The class of the control bar
			(default: 'tuiny-controlbar').
*/
Tuiny.Window = new Class(
{
	Extends: Tuiny.Panel,

	options:
	{
		label: '&nbsp;',
		draggable: true,
		dragLimit: { x: [ 0, false ], y: [ 0, false ] },
		collapsible: true,
		collapseTrigger: 'dblclick',
		classWindow: 'tuiny-window',
		classLabel: 'tuiny-label',
		classControlBar: 'tuiny-controlbar'
	},

	/*
		Constructor: Tuiny.Window

		Syntax:
			> var myWindow = new Tuiny.Window([options, container]);

		Parameters:
			options - The options.
			container - The container element.
	*/
	initialize: function()
	{
		var params = Array.link( arguments, { options: Type.isObject, container: Type.isElement } );
		this.parent( params.options, params.container );
	},

	/*
		Method: getLabel

		Retrieves the label text.

		Syntax:
			> var label = myWindow.getLabel();

		Returns:
			(string) The label.
	*/
	getLabel: function()
	{
		return this.label.get( 'text' );
	},

	/*
		Method: setLabel

		Sets the label text.

		Syntax:
			> myWindow.setLabel( label );

		Parameters:
			label - (string) The new label.
	*/
	setLabel: function( label )
	{
		return this.label.set( 'text', label );
	},

	/*
		Method: getControlBar

		Retrieves the control bar element.

		Syntax:
			> var myElement = myWindow.getControlBar();

		Returns:
			(Element) The control bar.
	*/
	getControlBar: function()
	{
		return this.controlbar;
	},

	/*
		Method: close

		Destroy the window.
	*/
	close: function()
	{
		this.toElement().destroy();
	},

	/*
		Method: collapse

		Hides the client area.
	*/
	collapse: function()
	{
		// Need to disable resizing
		this.disableResize();

		var currentWidth = this.content.getStyle( 'width' );
		this.label.setStyle( 'width', currentWidth );
		$$( [ this.header, this.content, this.footer ] ).setStyle( 'display', 'none' );
	},

	/*
		Method: expand

		Shows the client area.
	*/
	expand: function()
	{
		$$( [ this.header, this.content, this.footer ] ).setStyle( 'display', 'block' );
		this.label.setStyle( 'width' );

		// Need to enable resizing
		this.enableResize();
	},

	/*
		Method: toggleCollapse

		Toggles the client area.
	*/
	toggleCollapse: function()
	{
		if ( this.content.getStyle( 'display' ) == 'none' )
			this.expand();
		else
			this.collapse();
	},

	build: function()
	{
		this.parent();
		this.element.addClass( this.options.classWindow );

		this.label      = new Element( 'h3', { 'class': this.options.classLabel, 'html': this.options.label } );
		this.controlbar = new Element( 'div', { 'class': this.options.classControlBar } );

		this.label.store( 'widget', this );
		this.controlbar.store( 'widget', this );

		if ( this.options.draggable )
		{
			this.moveDrag = new Drag( this.element, { 'handle': this.label, 'limit': this.options.dragLimit } );
		}

		if ( this.options.collapsible )
		{
			this.label.addEvent( this.options.collapseTrigger, this.toggleCollapse.bind( this ) );
		}

		this.header.grab( this.label, 'before' );
		this.header.grab( this.controlbar, 'before' );
	}
});

/*
	Class: Tuiny.Button

	A standard input[type=button] with class 'tuiny-button'.

	Extends:
		<Tuiny.Widget>

	Options:
		label - (string) Text of the 'value' attribute (default: ' ').
		events - (object) Events property (see Mootools Element)
			(default: {}).
		classButton - (string) The class of the button
			(default: 'tuiny-button').
*/
Tuiny.Button = new Class(
{
	Extends: Tuiny.Widget,

	options:
	{
		label: ' ',
		events: {},
		classButton: 'tuiny-button'
	},

	/*
		Constructor: Tuiny.Button

		Syntax:
			> var myButton = new Tuiny.Button([options]);

		Parameters:
			options - The options.
	*/
	initialize: function( options )
	{
		this.parent( options );
		this.element = new Element( 'input',
		{
			'class': 'tuiny-button',
			'type': 'button',
			'value': this.options.label,
			'events': this.options.events
		});
		this.element.store( 'widget', this );
	},

	/*
		Method: getLabel

		Retrieves the label text.

		Syntax:
			> var label = myButton.getLabel();

		Returns:
			(string) The label.
	*/
	getLabel: function()
	{
		return this.label.get( 'value' );
	},

	/*
		Method: setLabel

		Sets the label text.

		Syntax:
			> myButton.setLabel( label );

		Parameters:
			label - (string) The new label.
	*/
	setLabel: function( label )
	{
		return this.label.set( 'value', label );
	}
});

/*
	Class: Tuiny.Toolbar

	A standard toolbar div.

	Extends:
		<Tuiny.Widget>

	Options:
		controls - (string) Text of the 'value' attribute (default: ' ').
		classToolbar - (string) The class of the toolbar container
			(default: 'tuiny-toolbar').
*/
Tuiny.Toolbar = new Class(
{
	Extends: Tuiny.Widget,

	options:
	{
		controls: [],
		classToolbar: 'tuiny-toolbar'
	},

	/*
		Constructor: Tuiny.Toolbar

		Syntax:
			> var myToolbar = new Tuiny.Toolbar([container, options, controls]);

		Parameters:
			options - (object) The options.
			container - (Element) The container element.
			controls - (array) Buttons or widgets.
	*/
	initialize: function()
	{
		var params = Array.link( arguments, { options: Type.isObject, container: Type.isElement, controls: Type.isArray } );
		this.setOptions( params.options );
		this.container = params.container || $( document.body );
		this.options.controls = params.controls || this.options.controls;

		this.build();
	},

	build: function()
	{
		this.element = new Element( 'div', { 'class': this.options.classToolbar });

		this.options.controls.each( function( item )
		{
			this.adopt( item );
		}.bind( this ));
	}
});

/*
	Class: Tuiny.Table

	A table manager (extends Mootools HtmlTable).

	Extends:
		HtmlTable
*/
Tuiny.Table = new Class(
{
	Extends: HtmlTable,

	options:
	{
		properties:
		{
			'class': 'tuiny-table'
		},
		classZebra: 'tuiny-table-tr-odd',
		classRowSelected: 'tuiny-table-tr-selected',
		classRowHovered: 'tuiny-table-tr-hovered',
		classSelectable: 'tuiny-table-tr-selectable'
	},

	/*
		Constructor: Tuiny.Table

		Syntax:
			> var myTable = new Tuiny.Table([table, options]);

		Parameters:
			table - (Element) A Table DOM element or it's id; if you
				do not specify one, one will be created.
			options - (object) The options.
	*/
	initialize: function()
	{
		var params = Array.link( arguments, { options: Type.isObject, table: Type.isElement } );
		this.parent( params.table, params.options );
		this.toElement().store( 'widget', this );
	}
});

/*
	Class: Tuiny.Slideshow

	A slideshow displaying photos.

	Extends:
		<Tuiny.Widget>

	Options:
		images - (array) The url or Elements of the images.
		period - (number) The duration of the intervals between images.
		classSlideshow - (string) The class of the slideshow container
			(default: 'tuiny-slideshow').
*/
Tuiny.Slideshow = new Class(
{
	Extends: Tuiny.Widget,

	options:
	{
		images: null,
		period: 3000,
		classSlideshow: 'tuiny-slideshow'
	},

	/*
		Constructor: Tuiny.Slideshow

		Syntax:
			> var mySlideshow = new Tuiny.Slideshow([container, options, images]);

		Parameters:
			options - (object) The options.
			container - (Element) The container element.
			images - (array) The images.
	*/
	initialize: function()
	{
		var params = Array.link( arguments, { options: Type.isObject, container: Type.isElement, images: Type.isArray } );
		this.setOptions( params.options );
		this.container = $( params.container ) || $( document.body );
		this.images = params.images || this.options.images;

		this.build();
	},

	build: function()
	{
		this.element = new Element( 'div', { 'class': this.options.classSlideshow });

		// Current index
		this.currentIndex = 0;

		// Array of urls or Element
		if ( instanceOf( this.images, Array ) )
		{
			this.images.each( function( item, index, imgs )
			{
				// If item is an url, converts it to an Element
				if ( instanceOf( item, String ) )
				{
					imgs[ index ] = new Element( 'img',
					{
						src: item,
						alt: '[ Image '+index+' ]'
					});
				}
			});
		}
		// Otherwise, we take img Elements from the container
		else
		{
			this.images = this.container.getElements( 'img' );
		}

		// Hide the images, but not the first
		this.images.each( function( item, index )
		{ 
			if ( index > 0 )
				item.set( 'opacity', 0 );
		});

		// Function called periodically
		this.showFunction = function()
		{
			this.images[ this.currentIndex ].fade( 'out' );
			this.currentIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
			this.images[ this.currentIndex ].fade( 'in' );
		};

		// Starts when the page loading is finished
		window.addEvent( 'load', function()
		{
			this.interval = this.showFunction.periodical( this.options.period, this );
		}.bind( this ));

		this.element.adopt( this.images );
		this.container.grab( this.element );
	}
});
