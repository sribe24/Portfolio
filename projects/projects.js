import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let selectedIndex = -1;
function renderPieChart(projectsGiven) {
    let svg = d3.select('svg');

    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    svg.selectAll('path').remove();

    arcs.forEach((arc, idx) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;

                svg.selectAll('path')
                    .attr('class', (_, pathIndex) => (
                        pathIndex === selectedIndex ? 'selected' : ''
                ));
                legend
                    .selectAll('li')
                    .attr('class', (_, idx) => (
                        idx === selectedIndex ? 'legend-item selected' : 'legend-item'
                    ));
                if (selectedIndex === -1) {
                    renderProjects(projects, projectsContainer, 'h2');
                } else {
                    let selectedYear = data[selectedIndex].label;

                    let filteredProjects = projects.filter((project) => {
                        return project.year == selectedYear;
                    });

                    renderProjects(filteredProjects, projectsContainer, 'h2')
                }


        });
    });    

    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    data.forEach((d, idx) => {
        let item = legend.append('li')
            .attr('class', 'legend-item')
            .attr('style', `--color: ${colors(idx)}`);

        item.append('span')
            .attr('class', 'swatch');

        item.append('span')
            .text(`${d.label} (${d.value})`);
    });
}

renderPieChart(projects);

let query = '';

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
    query = event.target.value
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
