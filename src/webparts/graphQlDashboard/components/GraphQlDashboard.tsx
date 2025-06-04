import * as React from 'react';
import styles from './GraphQlDashboard.module.scss';
import type { IGraphQlDashboardProps } from './IGraphQlDashboardProps';
import { escape } from '@microsoft/sp-lodash-subset';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type ContinentData = {
  name: string;
  countries: { code: string }[];
};

export default class GraphQlDashboard extends React.Component<IGraphQlDashboardProps, {
  labels: string[];
  values: number[];
}> {
  constructor(props: IGraphQlDashboardProps) {
    super(props);
    this.state = {
      labels: [],
      values: []
    };
  }

  public componentDidMount(): void {
    const query = `
      query {
        continents {
          name
          countries {
            code
          }
        }
      }
    `;

    fetch('https://countries.trevorblades.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })
      .then(res => res.json())
      .then(result => {
        const continents: ContinentData[] = result.data.continents;
        const labels = continents.map(c => c.name);
        const values = continents.map(c => c.countries.length);
        this.setState({ labels, values });
      })
      .catch(err => console.error('GraphQL fetch failed:', err));
  }

  public render(): React.ReactElement<IGraphQlDashboardProps> {
    const { hasTeamsContext, userDisplayName } = this.props;
    const { labels, values } = this.state;

    const chartData: ChartData<'bar'> = {
      labels,
      datasets: [
        {
          label: 'Number of Countries',
          data: values,
          backgroundColor: '#0078d4'
        }
      ]
    };

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return (
      <section className={`${styles.graphQlDashboard} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <h2>Welcome, {escape(userDisplayName)}!</h2>
        </div>

        <div className={styles.chartCard}>
          <h3>Countries per Continent</h3>
          <div style={{ height: '400px', width: '100%' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </section>
    );
  }
}
