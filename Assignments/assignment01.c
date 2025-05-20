//Write a program that prints the squares of 2 
//up until 128 into a txt file spereated by commas named 'output.txt'

#include <string.h>
#include <stdio.h>
#include <math.h>

void assignment_func(int i) {

FILE *file = fopen("output.txt", "w");
if(file == NULL){
    printf("Unable to open file \n");
    return;
}

int x =1;
while(x<=i){
    if(x==i){
    fprintf(file, "%.0f", pow(2,2));    
    }else
    fprintf(file, "%.0f, ", pow(2,x));
    x++;
}

fclose(file);
return;


}

int main(){
assignment_func(7);
    return 0;
}