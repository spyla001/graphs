import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment} from '../environments/environment';
import { Item } from './item.interface';

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {
Url: string = environment.serverUrl;
  constructor(private httpClient: HttpClient) { }
  public getData() {
    return this.httpClient.get<Item[]>(`${this.Url}/getUnion`);
  }
}
