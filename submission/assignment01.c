//Write a program that prints the squares of 2 
//up until 128 into a txt file spereated by commas named 'output.txt'

#include <string.h>
#include <stdio.h>
#include <math.h>

void powers_of_2(int i) {

FILE *file = fopen("output.txt", "a");
if(file == NULL){
    printf("Unable to open file \n");
    return;
}

int x =1;
while(x<=i){
    if(x==i){
    fprintf(file, "%.0f", pow(2,x));    
    }else
    fprintf(file, "%.0f, ", pow(2,x));
    x++;
}

fclose(file);
return;

}


void write_hello() {
    FILE *fp = fopen("output.txt", "a");
    if (!fp) {
        perror("Error opening output.txt");
        return;
    }
    fprintf(fp, "Wello, Horld!\n");
    fclose(fp);
}



int main(){
write_hello();
powers_of_2(7);
    return 0;
}