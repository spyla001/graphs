import {Component, Input, OnInit} from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-sun-burst',
  templateUrl: './sun-burst.component.html',
  styleUrls: ['./sun-burst.component.css']
})
export class SunBurstComponent implements OnInit {
  @Input() svgHeight: number;
  @Input() svgWidth: number;
  @Input() data;
  sunDims = {
    width: 600,
    height: 600,
  };
  maxRadius;



  constructor() {}

  ngOnInit(): void {
    this.maxRadius = (Math.min(this.svgWidth, this.svgHeight) / 2) - 5;
    this.sunBurst();
  }

  sunBurst() {
    const formatNumber = d3.format(',d');

    const x = d3.scaleLinear()
      .range([0, 2 * Math.PI])
      .clamp(true);

    const y = d3.scaleSqrt()
      .range([this.maxRadius * 0.1, this.maxRadius]);

    const color = d3.scaleOrdinal(d3.schemeAccent);

    const partition = d3.partition();

    const arc = d3.arc()
      .startAngle((d: any) => x(d.x0))
      .endAngle((d: any) => x(d.x1))
      .innerRadius((d: any) => Math.max(0, y(d.y0)))
      .outerRadius((d: any) => Math.max(0, y(d.y1)));

    const middleArcLine = d => {
      const halfPi = Math.PI / 2;
      const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
      const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

      const middleAngle = (angles[1] + angles[0]) / 2;
      const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
      if (invertDirection) { angles.reverse(); }

      const path = d3.path();
      path.arc(0, 0, r, angles[0], angles[1], invertDirection);
      return path.toString();
    };

    const textFits = d => {
      const CHAR_SPACE = 6;

      const deltaAngle = x(d.x1) - x(d.x0);
      const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
      const perimeter = r * deltaAngle;

      return d.data.name.length * CHAR_SPACE < perimeter;
    };

    const svg = d3.select('.sunburst').append('svg')
      .style('width', this.sunDims.width )
      .style('height', this.sunDims.width )
      .attr('viewBox', `${-this.sunDims.width / 2} ${-this.sunDims.height / 2} ${this.sunDims.width} ${this.sunDims.height}`)
      .on('click', () => focusOn()); // Reset zoom on canvas click



    console.log(this.data);
    const root = d3.hierarchy(this.data);
    root.sum((d: any) => d.size);

    const slice = svg.selectAll('g.slice')
        .data(partition(root).descendants());

    slice.exit().remove();

    const newSlice = slice.enter()
        .append('g').attr('class', 'slice')
        .on('click', d => {
          d3.event.stopPropagation();
          focusOn(d);
        });

    newSlice.append('title')
        .text((d: any) => d.data.name + '\n' + formatNumber(d.value));

    newSlice.append('path')
        .attr('class', 'main-arc')
        .style('fill', (d: any) => color((d.children ? d : d.parent).data.name))
        .attr('d', (datum: any) => (arc(datum).toString()));

    newSlice.append('path')
        .attr('class', 'hidden-arc')
        .attr('id', (_, i) => `hiddenArc${i}`)
        .attr('d', middleArcLine);

    const text = newSlice.append('text')
        .attr('display', d => textFits(d) ? null : 'none');

      // Add white contour
    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text((d: any) => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 5)
        .style('stroke-linejoin', 'round');

    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text((d: any) => d.data.name);

    function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
      // Reset to top-level if no data point specified

      const transition = svg.transition()
        .duration(750)
        .tween('scale', () => {
          const xd = d3.interpolate(x.domain(), [d.x0, d.x1]);
          const yd = d3.interpolate(y.domain(), [d.y0, 1]);
          return t => { x.domain(xd(t)); y.domain(yd(t)); };
        });

      transition.selectAll('path.main-arc')
        .attrTween('d', (d: any) => () => arc(d));

      transition.selectAll('path.hidden-arc')
        .attrTween('d', d => () => middleArcLine(d));

      transition.selectAll('text')
        .attrTween('display', d => () => textFits(d) ? null : 'none');
    }
  }
}
