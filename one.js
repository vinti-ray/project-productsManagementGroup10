function solution(a) {
    if(a==1){
        let sum=0, rem=0, count=0
        let totalSeat = parseInt(readLine())
        let totalBooking = parseInt(readLine())
        let array = readLine().split(" ").map(Number)
        if(totalSeat==0 && totalBooking==0)
            return "Remaining Seats-0"
        for(let i=0; i<array.length; i++){
            let a=array[i]
            if((sum+a)>totalSeat){
                rem=array[i]
                count++
            }else
                sum+=array[i]
        }
        for(let j=0; j<array.length-count; j++){
            console.log(`Booked-${array[j]}`)
        }
        return `SEATS NOT AVAILABLE FOR BUS-${rem}
Remaining Seats-${totalSeat-sum}`
    }else{
        let sum=0, count=0
        let birthSeat = readLine().split(" ").map(Number)
        let totalSeat = parseInt(readLine())
        let typeOfSeat = readLine().split(" ").map(Number)
        for(let i of birthSeat)
            sum+=i
        for(let i=0; i<typeOfSeat.length; i+=2){
            if(birthSeat[typeOfSeat[i]-1]>=typeOfSeat[i+1]){
                console.log(`Booked-${typeOfSeat[i+1]}`)
                birthSeat[typeOfSeat[i]-1]-=typeOfSeat[i+1]
                sum-=typeOfSeat[i+1]
            }else{
                console.log(`SEATS NOT AVAILABLE FOR TRAIN-${typeOfSeat[i+1]}`)
            }
        }
        return `Remaining Seats-${sum}`
    }
}


function main() {
    var a = parseInt(readLine())
    var res = solution(a);
    console.log(res);
}