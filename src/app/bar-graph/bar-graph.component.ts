import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {Item} from '../item.interface';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

@Component({
  selector: 'app-bar-graph',
  templateUrl: './bar-graph.component.html',
  styleUrls: ['./bar-graph.component.css']
})
export class BarGraphComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chart', {static: false})  chartContainer: ElementRef;
  @Input() data: Item[];
  @Input() svgHeight: number;
  @Input() svgWidth: number;


  xlabel: string;
  ylabel: string;
  margin = {
    top: 30,
    right: 0,
    bottom: 70,
    left: 70
  };
  graphHeight;
  graphWidth;




  constructor(private element: ElementRef) { }
  ngAfterViewInit() {
  }

  ngOnInit() {
    this.graphWidth = this.svgWidth - this.margin.left - this.margin.right;
    this.graphHeight = this.svgHeight - this.margin.top - this.margin.bottom;
    this.xlabel = (Object.keys(this.data[0])[0]).toUpperCase();
    this.ylabel = (Object.keys(this.data[0])[1]).toUpperCase();
    console.log(this.xlabel);
    console.log(this.data);
    this.createBar(this.data);
  }

  ngOnChanges() {
  }



  createBar(data) {
    const svg = d3.select('.barChart').append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);
// appending a group named graph
    const graph = svg.append('g')
      .attr('width', this.graphWidth)
      .attr('height', this.graphHeight)
      .attr('fill', 'green')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
// creating xAxisgroup
    const xAxisgroup = graph.append('g')
      .attr('transform', `translate(${0},${this.graphHeight})`)
      .attr('class', 'grid');

// creating yAxisgroup
    const yAxisgroup = graph.append('g')
      .attr('class', 'grid');

// initializing yaxis scale
    const y = d3.scaleLinear()
      .range([this.graphHeight, 0]);

// initializing x axis cale
    const x = d3.scaleBand()
      .range([0, this.graphWidth])
      .paddingInner(0.8)
      .paddingOuter(0.8);
// creating x-axis
    const xAxis = d3.axisBottom(x)
      .tickSize(-(this.svgHeight - this.margin.top - this.margin.bottom));
// creating y axis
    const yAxis = d3.axisLeft(y)
      .ticks(10)
      .tickSize(-this.svgWidth + this.margin.left + this.margin.right)
      .tickFormat(d =>  `${d}`);
// initializing tip
    const tip = d3Tip()
      .attr('class', 'd3-tip')
      .attr('fill', 'black')
      .offset([-10, 0]);


    // label y-axis
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', 0 - (this.svgHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(this.ylabel);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // label x-axis
    svg.append('text')
      .attr('transform',
        `translate(${this.svgWidth / 2},${this.svgHeight - 30})`)
      .style('text-anchor', 'middle')
      .text(this.xlabel);

// updating graph
    // tslint:disable-next-line:no-shadowed-variable
    const update = (data: Item[]) =>  {
      const  domainVar = data.map(d => d.name);

      // @ts-ignore
        // tslint:disable-next-line:no-shadowed-variable variable-name
      color.domain( domainVar);
      console.log(color('star'));


      // join updated data to elements::
      const rect = graph.selectAll('rect').data(data);
      console.log(rect);
      // remove unwanted shapes from dom
      rect.exit().remove();

      // update the domains
      y.domain([0, d3.max(data, d => d.orders)]);
      x.domain(data.map(d => d.name));

      // add attrs to rects already in the DOM
      rect.attr('width', x.bandwidth)
        .attr('fill', d => color(d.name))
        .attr('x', d => x(d.name))
        .transition().duration(1500)
        .attr('height', d => this.graphHeight - y(d.orders))
        .attr('y', d => y(d.orders));


      // append enter selection of dom
      rect.enter()
        .append('rect')
        .attr('width', x.bandwidth)
        .attr('fill', d => color(d.name))
        .attr('x', (d) => x(d.name))
        .attr('height', 0)
        .attr('y', this.graphHeight)
        .transition().duration(1500)
        .attrTween('width', widthTween)
        .attr('height', d => this.graphHeight - y(d.orders))
        .attr('y', d => y(d.orders));

      xAxisgroup.call(xAxis);

      yAxisgroup.call(yAxis);

      xAxisgroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end');
      xAxisgroup.selectAll('line')
        .attr('');
      svg.call(tip);

      tip.html((d) =>  {
        return ' <span style="font-weight: 100; font-size: .7em">' + d.orders + '</span>';
      });
    };

    const widthTween  = (d) => {
      const i  = d3.interpolate(0, x.bandwidth());

      return (t) => {
        return i(t).toString();
      };
    };
    update(data);

    const handleMouseOver = (d, i, n) => {
      console.log(d);
      tip.style('background-color', color(d.name));
      d3.select(d3.event.target)
        .attr('opacity', .5);
    };
    const handleMouseOut =  (d, i, n) => {
      d3.select(d3.event.target)
        .attr('opacity', 1);
      tip.hide();
    };

    graph.selectAll('rect')
      .on('mouseover', tip.show)
      .on('mousemove', handleMouseOver)
      .on('mouseout', handleMouseOut);
  }
}
