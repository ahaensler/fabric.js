import { fabric } from '../../HEADER';
import { SHARED_ATTRIBUTES } from '../parser/attributes';
import { parseAttributes } from '../parser/parseAttributes';
import { TClassProperties } from '../typedefs';
import { cos } from '../util/misc/cos';
import { degreesToRadians } from '../util/misc/radiansDegreesConversion';
import { sin } from '../util/misc/sin';
import { FabricObject } from './fabricObject.class';
import { fabricObjectDefaultValues } from './object.class';

export class Circle extends FabricObject {
  /**
   * Radius of this circle
   * @type Number
   * @default
   */
  radius: number;

  /**
   * degrees of start of the circle.
   * probably will change to degrees in next major version
   * @type Number 0 - 359
   * @default 0
   */
  startAngle: number;

  /**
   * End angle of the circle
   * probably will change to degrees in next major version
   * @type Number 1 - 360
   * @default 360
   */
  endAngle: number;

  /**
   * @private
   * @param {String} key
   * @param {*} value
   */
  _set(key: string, value: any) {
    super._set(key, value);

    if (key === 'radius') {
      this.setRadius(value);
    }

    return this;
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx context to render on
   */
  _render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      this.radius,
      degreesToRadians(this.startAngle),
      degreesToRadians(this.endAngle),
      false
    );
    this._renderPaintInOrder(ctx);
  }

  /**
   * Returns horizontal radius of an object (according to how an object is scaled)
   * @return {Number}
   */
  getRadiusX(): number {
    return this.get('radius') * this.get('scaleX');
  }

  /**
   * Returns vertical radius of an object (according to how an object is scaled)
   * @return {Number}
   */
  getRadiusY(): number {
    return this.get('radius') * this.get('scaleY');
  }

  /**
   * Sets radius of an object (and updates width accordingly)
   */
  setRadius(value: number) {
    this.radius = value;
    this.set({ width: value * 2, height: value * 2 });
  }

  /**
   * Returns object representation of an instance
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} object representation of an instance
   */
  toObject(propertiesToInclude: (keyof this)[] = []): object {
    return super.toObject([
      'radius',
      'startAngle',
      'endAngle',
      ...propertiesToInclude,
    ]);
  }

  /* _TO_SVG_START_ */

  /**
   * Returns svg representation of an instance
   * @return {Array} an array of strings with the specific svg representation
   * of the instance
   */
  _toSVG(): (string | number)[] {
    const angle = (this.endAngle - this.startAngle) % 360;

    if (angle === 0) {
      return [
        '<circle ',
        'COMMON_PARTS',
        'cx="0" cy="0" ',
        'r="',
        this.radius,
        '" />\n',
      ];
    } else {
      const { radius } = this;
      const start = degreesToRadians(this.startAngle),
        end = degreesToRadians(this.endAngle),
        startX = cos(start) * radius,
        startY = sin(start) * radius,
        endX = cos(end) * radius,
        endY = sin(end) * radius,
        largeFlag = angle > 180 ? '1' : '0';
      return [
        '<path d="M ' + startX + ' ' + startY,
        ' A ' + radius + ' ' + radius,
        ' 0 ',
        +largeFlag + ' 1',
        ' ' + endX + ' ' + endY,
        '" ',
        'COMMON_PARTS',
        ' />\n',
      ];
    }
  }
  /* _TO_SVG_END_ */

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by {@link Circle.fromElement})
   * @static
   * @memberOf Circle
   * @see: http://www.w3.org/TR/SVG/shapes.html#CircleElement
   */
  static ATTRIBUTE_NAMES = ['cx', 'cy', 'r', ...SHARED_ATTRIBUTES];

  /**
   * Returns {@link Circle} instance from an SVG element
   * @static
   * @memberOf Circle
   * @param {SVGElement} element Element to parse
   * @param {Function} [callback] Options callback invoked after parsing is finished
   * @param {Object} [options] Partial Circle object to default missing properties on the element.
   * @throws {Error} If value of `r` attribute is missing or invalid
   */
  static fromElement = function (
    element: SVGElement,
    callback: (circle: Circle) => any
  ) {
    const {
      left = 0,
      top = 0,
      radius,
      ...otherParsedAttributes
    } = parseAttributes(element, Circle.ATTRIBUTE_NAMES);

    if (!radius || radius < 0) {
      throw new Error(
        'value of `r` attribute is required and can not be negative'
      );
    }

    // this probably requires to be fixed for default origins not being top/left.
    callback(
      new Circle({
        ...otherParsedAttributes,
        radius,
        left: left - radius,
        top: top - radius,
      })
    );
  };

  /* _FROM_SVG_END_ */

  /**
   * Returns {@link Circle} instance from an object representation
   * @static
   * @memberOf Circle
   * @param {Object} object Object to create an instance from
   * @returns {Promise<Circle>}
   */
  static fromObject = (object: object): Promise<Circle> =>
    FabricObject._fromObject(Circle, object);
}

export const circleDefaultValues: Partial<TClassProperties<Circle>> = {
  type: 'circle',
  radius: 0,
  startAngle: 0,
  endAngle: 360,
  stateProperties: fabricObjectDefaultValues.stateProperties.concat(
    'radius',
    'startAngle',
    'endAngle'
  ),
  cacheProperties: fabricObjectDefaultValues.cacheProperties.concat(
    'radius',
    'startAngle',
    'endAngle'
  ),
};

Object.assign(Circle.prototype, circleDefaultValues);

fabric.Circle = Circle;
