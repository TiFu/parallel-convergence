#pragma once

namespace replay
{
	struct vector2 
	{ 
		vector2(float a_x, float a_y) 
			: x(a_x), y(a_y)
		{
		}

		float x; float y; 
	};

	class camera
	{
	public:
		camera() { }
		virtual ~camera() { }

		virtual bool connect_to_league() = 0;

		virtual vector2 get_position() = 0;
		virtual void set_position(float x, float y) = 0;
	};

	class camera_impl : public camera
	{
	public:
		camera_impl();
		~camera_impl() { }

		bool connect_to_league();

		vector2 get_position();
		void set_position(float x, float y);
		void set_position(vector2 vec);

	};
};