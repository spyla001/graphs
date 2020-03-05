import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';

import { AppComponent } from './app.component';
import { BarGraphComponent } from './bar-graph/bar-graph.component';
import { PiechartComponent } from './piechart/piechart.component';
import { SunBurstComponent } from './sun-burst/sun-burst.component';
import { ChartComponent } from './chart/chart.component';
import { LineGraphComponent } from './line-graph/line-graph.component';
import { HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    BarGraphComponent,
    PiechartComponent,
    SunBurstComponent,
    ChartComponent,
    LineGraphComponent
  ],
  imports: [
    BrowserModule,
    HighchartsChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
