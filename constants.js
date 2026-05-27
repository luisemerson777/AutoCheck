
export const InspectionStatus = {
  EXCELLENT: 'Excelente',
  GOOD: 'Bom',
  ACCEPTABLE: 'Aceitável',
  REPLACE: 'Substituição',
  OK: 'OK',
  LOW: 'Baixo',
  CHANGE_REQUIRED: 'Sujeito a Troca',
  MINOR_DEFECT: 'Defeito Leve',
  MAJOR_DEFECT: 'Defeito Grave'
};

export const INITIAL_FORM_STATE = {
  id: '',
  date: '',
  client: { name: '', phone: '', email: '' },
  vehicle: { brandModel: '', plate: '', mileage: '', year: '' },
  tires: { frontLeft: 5, frontRight: 5, rearLeft: 5, rearRight: 5, grooves: 'OK' },
  fluids: { engineOil: 'OK', brakeFluid: 'OK', coolant: 'OK', wiperFluid: 'OK', transmissionFluid: 'OK' },
  safety: { headlights: 'OK', tailLights: 'OK', turnSignals: 'OK', wipers: 'OK', horn: true },
  electrical: { batteryHealth: 5, alternator: 'OK', belts: 'OK' },
  checkout: { testDrive: false, wheelTorque: false, cleaning: false, personalObjects: true },
  partsUsed: '',
  observations: '',
  totalValue: '0,00',
  photos: []
};
