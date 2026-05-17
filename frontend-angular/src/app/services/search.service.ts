import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject
} from 'rxjs';

@Injectable({

  providedIn: 'root'

})

export class SearchService {

  // 🔍 TÉRMINO GLOBAL

  private termino =
    new BehaviorSubject<string>(
      ''
    );

  // 📡 OBSERVABLE

  termino$ =
    this.termino.asObservable();

  // ✏️ ACTUALIZAR BÚSQUEDA

  setTermino(
    valor: string
  ): void {

    this.termino.next(valor);

  }

}