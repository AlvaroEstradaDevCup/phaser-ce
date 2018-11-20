/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
* @class PIXI.PrimitiveShader
* @constructor
* @param gl {WebGLContext} the current WebGL drawing context
*/
PIXI.PrimitiveShader = function (gl)
{
    /**
     * @property _UID
     * @type Number
     * @private
     */
    this._UID = Phaser._UID++;

    /**
     * @property gl
     * @type WebGLContext
     */
    this.gl = gl;

    /**
     * The WebGL program.
     * @property program
     * @type Any
     */
    this.program = null;

    /**
     * The fragment shader.
     * @property fragmentSrc
     * @type Array
     */
    this.fragmentSrc = [
        'precision mediump float;',
        'varying vec4 vColor;',

        'void main(void) {',

                //Get Texture Size
                'vec2 vTextureSize =  textureSize(uSampler, 0);',
    
                //Calculate half pixel
                'vec2 HalfPixel = (1.0 / vTextureSize) * 0.5;',
                
                //Calculate virtual pixel
                //Top-Left
                'vec2 coord1 = vec2(vTextureCoord.x - HalfPixel.x, vTextureCoord.y + HalfPixel.y);',
                //Top-Right
                'vec2 coord2 = vec2(vTextureCoord.x + HalfPixel.x, vTextureCoord.y + HalfPixel.y);',
                //Bottom-Left
                'vec2 coord3 = vec2(vTextureCoord.x - HalfPixel.x, vTextureCoord.y - HalfPixel.y);',
                //Bottom-Right
                'vec2 coord4 = vec2(vTextureCoord.x + HalfPixel.x, vTextureCoord.y - HalfPixel.y);',
    
                //Get colors
                'vec4 colorA = vec4(texture2D(uSampler, coord1));',
                'vec4 colorB = vec4(texture2D(uSampler, coord2));',
                'vec4 colorC = vec4(texture2D(uSampler, coord3));',
                'vec4 colorD = vec4(texture2D(uSampler, coord4));',
    
                //Convert texcoord to pixel coord
                'vec2 currentPixelcoord = vTextureCoord * vTextureSize;',
    
                //Get the displacemnet value in X and Y
                'float valueX = fract(currentPixelcoord.x - 0.5);',
                'float valueY = fract(currentPixelcoord.y - 0.5);',
    
                //X Interpolation
                'vec4 colorX1 = mix(colorA, colorB, valueX);',
                'vec4 colorX2 = mix(colorC, colorD, valueX);',
    
                //Y Interpolation
                'vec4 finalColor = mix(colorX1, colorX2, valueY);',
    
                //Return final color
                'gl_FragColor = finalColor;',
    
                '}'
    ];

    /**
     * The vertex shader.
     * @property vertexSrc
     * @type Array
     */
    this.vertexSrc = [
        'attribute vec2 aVertexPosition;',
        'attribute vec4 aColor;',
        'uniform mat3 translationMatrix;',
        'uniform vec2 projectionVector;',
        'uniform vec2 offsetVector;',
        'uniform float alpha;',
        'uniform float flipY;',
        'uniform vec3 tint;',
        'varying vec4 vColor;',

        'void main(void) {',
        '   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);',
        '   v -= offsetVector.xyx;',
        '   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);',
        '   vColor = aColor * vec4(tint * alpha, alpha);',
        '}'
    ];

    this.init();
};

PIXI.PrimitiveShader.prototype.constructor = PIXI.PrimitiveShader;

/**
* Initialises the shader.
*
* @method PIXI.PrimitiveShader#init
*/
PIXI.PrimitiveShader.prototype.init = function ()
{
    var gl = this.gl;

    var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
    gl.useProgram(program);

    // get and store the uniforms for the shader
    this.projectionVector = gl.getUniformLocation(program, 'projectionVector');
    this.offsetVector = gl.getUniformLocation(program, 'offsetVector');
    this.tintColor = gl.getUniformLocation(program, 'tint');
    this.flipY = gl.getUniformLocation(program, 'flipY');

    // get and store the attributes
    this.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    this.colorAttribute = gl.getAttribLocation(program, 'aColor');

    this.attributes = [ this.aVertexPosition, this.colorAttribute ];

    this.translationMatrix = gl.getUniformLocation(program, 'translationMatrix');
    this.alpha = gl.getUniformLocation(program, 'alpha');

    this.program = program;
};

/**
* Destroys the shader.
*
* @method PIXI.PrimitiveShader#destroy
*/
PIXI.PrimitiveShader.prototype.destroy = function ()
{
    this.gl.deleteProgram(this.program);
    this.uniforms = null;
    this.gl = null;

    this.attributes = null;
};
