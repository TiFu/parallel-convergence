
using System.Windows;

namespace LeagueCoachingHelperPlugin
{
    public class VectorThatDoesntSuck
    {
        public VectorThatDoesntSuck(Vector copy)
        {
            this.X = (float) copy.X;
            this.Y = (float) copy.Y;
        }

        public VectorThatDoesntSuck()
        {
            
        }

        public float X { get; set; }

        public float Y { get; set; }
    }
}
