import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Item} from '../item.interface';
import d3Tip from 'd3-tip';

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.css']
})
export class PiechartComponent implements OnInit {

  @Input() data: Item[];
  @Input() svgHeight: number;
  @Input() svgWidth: number;
  @Input() radius: number;

  cent;
  constructor() { }

  ngOnInit() {
    this.cent = { x: (this.svgWidth / 2 + 5), y: (this.svgHeight / 2 + 5)};

    this.createPieChart(this.data);
  }

  createPieChart(data: any) {
    const svg = d3.select('.piechart')
      .append('svg')
      .attr('height', this.svgHeight + 10)
      .attr('width', this.svgWidth + 150);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const graph = svg.append('g')
      .attr('transform', `translate(${this.cent.x},${this.cent.y})`);


    const pie = d3.pie()
      .sort(null)
      .value((d: any) => d.orders);



    const arc = d3.arc()
      .outerRadius(this.radius)
      .innerRadius(this.radius / 6);

    console.log((pie(data)));

    const legend = svg.append('g')
      .attr('transform', `translate(${this.svgWidth + 10},0)`)
      .attr('height', 100)
      .attr('width', 100);




    const update = (d: Item[]) => {
      const domain = d.map(dom => dom.name);

      color.domain(domain);

      const chart = graph.selectAll('g')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class','slice')



      chart.exit().remove();


      const arcTweenEnter = (d) => {
        const i = d3.interpolate(d.endAngle, d.startAngle);
        return (t) => {
          d.startAngle = i(t);
          return arc(d).toString();
        };
      };

      chart.append('path')
        .attr('d', (datum: any) => arc(datum))
        .attr('class', 'arc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', (datum: any, index) => color(datum.data.name))
        .transition().duration(750)
        .attrTween('d', arcTweenEnter);

      chart.append('text')
        .attr(
          'transform',
          (d: any) => {
            d.innerRadius = 0;
            d.outerRadius = 0;
            const c  = arc.centroid(d);
            return 'translate(' + c[0] + ',' + c[1] + ')';
          })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', '20px')
        .style('text-decoration', 'bold')
        .text((d: any) => d.data.orders);

      const legends = legend.selectAll('rect')
        .data(data);
      console.log(legends);
      legends.enter()
        .append('rect')
        .attr('fill', (d: any) => color(d.name))
        .attr('height', 10)
        .attr('width', 10)
        .attr('y', (d, i) => i * 20);
      const legendText = legend.selectAll('text')
        .data(data);
      // @ts-ignore
      legendText.enter()
        .append('text')
        .attr('transform', `translate(12,10)`)
        .attr('fill', (d: any) => color(d.name))
        .text((d: any) => d.name)
        .attr('y', (d, i) => i * 20);

    };
    const tip = d3Tip()
      .attr('class', 'tip card')
      .html(d => {let content = `<div>orders: ${d.data.orders}</div>`; content += `<div>orders: ${d.data.orders}</div>`;
        content += `<div>orders: ${d.data.orders}</div>`; return `<p>${d.data.orders}<p>`; });

    graph.call(tip);

    update(data);
    const handleMouseOver = (d, i, n) => {
      const element = d3.select(d3.event.target);
      console.log(element);
      element.style('opacity', 0.5);
    };

    const handleMouseOut = (d, i, n) => {
      const element = d3.select(d3.event.target);
      console.log(element);
      element.style('opacity', 1);
    };

    graph.selectAll('path')
      .on('mouseover', (d, i, n) => {
        tip.show(d, n[i]);
        handleMouseOver(d, i, n);
      })
      .on('mouseout',(d, i, n) => {
        tip.hide();
        handleMouseOut(d, i, n);
      } );
  }
}
