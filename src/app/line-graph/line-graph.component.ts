import {Component, Input, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {Line} from '../line';
import d3Tip from 'd3-tip';
@Component({
  selector: 'app-line-graph',
  templateUrl: './line-graph.component.html',
  styleUrls: ['./line-graph.component.css']
})
export class LineGraphComponent implements OnInit {
  @Input() svgHeight: number;
  @Input() svgWidth: number;

  data: Line[] = [
    {
      orders: 37,
      date: '2018-04-30'
    },
    {
      orders: 11,
      date: '2015-06-05'
    },
    {
      orders: 25,
      date: '2017-02-23'
    },
    {
      orders: 38,
      date: '2017-12-02'
    },

    {
      orders: 36,
      date: '2015-02-18'
    },
    {
      orders: 29,
      date: '2014-04-14'
    }
  ];
  xlabel: string;
  ylabel: string;
  margin = {
    top: 40,
    right: 20,
    bottom: 50,
    left: 100
  };
  graphWidth;
  graphHeight;

  constructor() {
  }

  ngOnInit() {
    this.graphWidth = this.svgWidth - this.margin.left - this.margin.right;
    this.graphHeight = this.svgHeight - this.margin.top - this.margin.bottom;
    this.construct(this.data);
  }

  construct(data) {

    const tip = d3Tip()
      .attr('class', 'tip')
      .html(d => '<p><strong>${d.orders}</strong></p>');

    // sort data based on date
    data.sort((a: any, b: any) => (new Date(a.date) - new Date(b.date)));
    const svg = d3.select('.line')
      .append('svg')
      .attr('height', this.svgHeight)
      .attr('width', this.svgWidth);
    const graph = svg.append('g')
      .attr('height', this.graphHeight)
      .attr('width', this.graphWidth)
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const x = d3.scaleTime().range([0, this.graphWidth]);
    const y = d3.scaleLinear().range([this.graphHeight, 0]);

    const xAxisgroup = graph.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.graphHeight})`);
    const yAxisgroup = graph.append('g')
      .attr('class', 'y-axis');

    // drawing line
    const line = d3.line<Line>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.orders))
      .curve(d3.curveMonotoneX);

    graph.call(tip);

    const update = (data: Line[]) => {
      const maxD = d3.max(data.map(d => d.orders));
      console.log(maxD);
      y.domain([0, maxD]);
      x.domain(d3.extent(data, d => new Date(d.date)));


      // updating path data
      const path = graph.append('path')
                        .data([data])
                        .attr('fill', 'none')
                        .attr('stroke', '#00bfa5')
                        .attr('stroke-width', 2)
                        .attr('d', line);

      const pathLength = path.node().getTotalLength();
      path
        .attr('stroke-dashoffset', pathLength)
        .attr('stroke-dasharray', pathLength)
        .transition().duration(2000)
        .attr('stroke-dashoffset', 0);

      // animating updated path
      const updatedPath = d3
        .select('path')
        .interrupt()
        .datum(data)
        .attr('d', line);
      // creating circles
      const circles = graph.selectAll('circles')
        .data(data);

      // updating current positions
      circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.orders));

      // exit removal
      circles.exit().remove();
      // enter selection
      circles.enter()
        .append('circle')
        .attr('fill', 'violet')
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.orders))
        .attr('r', 0)
        .transition().duration(2000)
        .attr('r', 4);


      const handlehover = (d, i, n) => {
        console.log(d, i, n);
        tip.show(d, n[i]);
        d3.select(n[i])
          .transition().duration(100)
          .attr('r', 7);
      };

      const handleout = (d, i, n) => {
        console.log(d, i, n);
        tip.hide(d, n[i]);
        d3.select(n[i])
          .transition().duration(100)
          .attr('r', 4);
      };

      // animation
      graph.selectAll('circle')
        .on('mouseover', (d, i, n) => {
          handlehover(d, i, n);
        })
        .on('mouseout', (d, i, n) => {
          handleout(d,i,n);
        });
      // axes
      const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickSize(-this.svgWidth + this.margin.left + this.margin.right);
      const yAxis = d3.axisLeft(y)
        .ticks(2)
        .tickSize(-this.svgHeight + this.margin.top + this.margin.bottom)
        .tickFormat(d => d + 'm');
      xAxisgroup.selectAll('g line')
        .attr('color', 'white');


      xAxisgroup.call(xAxis);
      yAxisgroup.call(yAxis);

      xAxisgroup.selectAll('text')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'end');


    };
    update(data);
  }

}


