const API_BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

export type Customer = {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
  _links?: {
    self: { href: string };
    customer: { href: string };
    trainings: { href: string };
  };
};

export type Training = {
  date: string;
  duration: number;
  activity: string;
  customer?: string;
  _links?: {
    self: { href: string };
    training: { href: string };
    customer: { href: string };
  };
};

export type TrainingWithCustomer = {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: {
    id: number;
    firstname: string;
    lastname: string;
    streetaddress: string;
    postcode: string;
    city: string;
    email: string;
    phone: string;
  };
};

export const api = {
  // Customer endpoints
  getCustomers: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers`);
    const data = await response.json();
    return data._embedded.customers;
  },

  getCustomer: async (id: number): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    return response.json();
  },

  addCustomer: async (customer: Omit<Customer, '_links'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    return response.json();
  },

  updateCustomer: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    return response.json();
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // Training endpoints
  getTrainings: async (): Promise<TrainingWithCustomer[]> => {
    const response = await fetch(`${API_BASE_URL}/gettrainings`);
    return response.json();
  },

  addTraining: async (training: Omit<Training, '_links'>): Promise<Training> => {
    const response = await fetch(`${API_BASE_URL}/trainings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(training),
    });
    return response.json();
  },

  deleteTraining: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/trainings/${id}`, {
      method: 'DELETE',
    });
  },

  // Reset database
  resetDatabase: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
    });
  },
}; 