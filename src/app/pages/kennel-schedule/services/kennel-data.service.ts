import { Injectable } from '@angular/core';
import { PocketbaseService } from '../../../../services/pocketbase.service';
import { KennelRow } from '../types';

@Injectable()
export class KennelDataService {
  constructor(private pb: PocketbaseService) {}

  async getAreas() {
    const areas = await this.pb.getAll('area', 200);
    return areas.sort((a: any, b: any) => a.nome_area.localeCompare(b.nome_area));
  }

  async loadAreaData(areaId: string, rows: KennelRow[]) {
    const boxes = await this.pb.getAll('box', 200, {
      filter: `area.id = "${areaId}"`,
      expand: 'area',
    });

    for (const b of boxes) {
      b['area'] = b.expand?.['area'] || null;
    }
    const occupations = await this.pb.getAll('occupations', 200, {
      filter: `box.area.id = "${areaId}"`,
      expand: 'dog,box,box.area',
    });
    const data: Record<string, Record<string, string>> = {};

    for (const row of rows) {
      if (row.kind === 'day') {
        data[row.key] = {};
        for (const box of boxes) {
          data[row.key][box['number']] = '';
        }
      }
    }

    for (const occ of occupations) {
      const boxNum = occ.expand?.['box']?.['number'];
      const dogName = occ.expand?.['dog']?.['name'] || '';
      if (!boxNum || !dogName) continue;
      const start = new Date(occ['arrival_date']);
      const end = new Date(occ['departure_date'] || occ['arrival_date']);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      for (const row of rows) {
        if (row.kind !== 'day') continue;

        const r = new Date(row.date);
        r.setHours(12, 0, 0, 0);

        if (r >= start && r <= end) {
          const existing = data[row.key][boxNum];

          if (existing && existing.length > 0) {
            const parts = existing.split(/,\s*/);
            if (!parts.includes(dogName)) {
              data[row.key][boxNum] = `${existing}, ${dogName}`;
            }
          } else {
            data[row.key][boxNum] = dogName;
          }
        }
      }
    }
    return {
      area: { id: areaId },
      boxes,
      data,
    };
  }

  async getDogs() {
    return await this.pb.getAll('dogs', 200);
  }

  async getAllBoxes() {
    const boxes = await this.pb.getAll('box', 500, { expand: 'area' });
    for (const b of boxes) {
      b['area'] = b.expand?.['area'] || null;
    }
    return boxes;
  }

  async getOccupationsForBox(boxId: string, localKey: string) {
    return await this.pb.getAll('occupations', 2, {
      filter: `box.id = "${boxId}" && arrival_date <= "${localKey} 23:59:59" && departure_date >= "${localKey} 00:00:00"`,
      expand: 'dog,box',
    });
  }
}
