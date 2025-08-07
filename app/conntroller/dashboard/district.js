

exports.provincepopulationChart = async(req,res)=>{
    try{
        const population_chart = {
                chart: {
                    type: 'pie',
                    height: 220
                },
                title: {
                    text: 'Population Data',
                    align: 'left',
                    verticalAlign: 'top',
                    y: 10
                },
                subtitle: {
                    text: '',
                    align: 'right',
                    verticalAlign: 'top',
                    y: 10,
                    style: {
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }
                },
                credits: { enabled: false },
                plotOptions: {
                    pie: {
                        innerSize: '50%',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                legend: {
                    align: 'left',
                    verticalAlign: 'middle',
                    layout: 'vertical',
                    margin: 25
                },
                series: [{
                    name: 'Population',
                    colorByPoint: true,
                    data: [
                        { name: 'Children Below 5', y: 55, color: '#0fac81' },
                        { name: 'Adolescent Girls', y: 25, color: '#dc143c' },
                        { name: 'Woman of Child <br>Bearing Age', y: 20, color: '#213dad' }
                    ]
                }]
            }
        
            return Helper.response(true, '', { population_chart }, res, 200);
        
        
        
    }catch(err){
        console.error("Error fetching province population chart:", err);
        return Helper.response(false, "Error fetching province population chart", {}, res, 500);
    }
}